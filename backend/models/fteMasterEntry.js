'use strict';

var step = require('h5.step');

module.exports = function setupFteMasterEntryModel(app, mongoose)
{
  var fteMasterTaskCompanySchema = mongoose.Schema({
    id: String,
    name: String,
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  }, {
    _id: false
  });

  var fteMasterTaskFunctionSchema = mongoose.Schema({
    id: String,
    companies: [fteMasterTaskCompanySchema]
  }, {
    _id: false
  });

  var fteMasterTaskSchema = mongoose.Schema({
    type: {
      type: String,
      enum: ['prodTask', 'prodFlow']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    noPlan: Boolean,
    functions: [fteMasterTaskFunctionSchema]
  }, {
    _id: false
  });

  var fteMasterEntrySchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    locked: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      required: true
    },
    updatedAt: {
      type: Date,
      default: null
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creatorLabel: {
      type: String,
      required: true
    },
    updater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updaterLabel: {
      type: String,
      default: null
    },
    tasks: [fteMasterTaskSchema]
  }, {
    id: false
  });

  fteMasterEntrySchema.statics.TOPIC_PREFIX = 'fte.master';

  fteMasterEntrySchema.statics.createForShift = function(shiftId, user, done)
  {
    step(
      function queryCompaniesStep()
      {
        mongoose.model('Company')
          .find({$or: [{fteMaster: true}, {fteMasterMaster: true}]})
          .sort({name: 1})
          .lean()
          .exec(this.next());
      },
      function handleCompaniesQueryResultStep(err, companies)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var functions = [{
          id: 'master',
          companies: []
        }];
        var otherCompanies = [];

        companies.forEach(function(company)
        {
          var companyEntry = {
            id: company._id,
            name: company.name,
            count: 0
          };

          if (company.fteMasterMaster)
          {
            functions[0].companies.push(companyEntry);
          }

          if (company.fteMaster)
          {
            otherCompanies.push(companyEntry);
          }
        });

        mongoose.model('User').schema.path('prodFunction').enumValues.forEach(function(prodFunction)
        {
          if (prodFunction !== 'master' && prodFunction !== 'unspecified')
          {
            functions.push({
              id: prodFunction,
              companies: otherCompanies
            });
          }
        });

        this.functions = functions;
      },
      function queryProdFlowsStep()
      {
        this.tasks = getProdFlowsByDivisionId(shiftId.division, this.functions);

        setImmediate(this.next());
      },
      function queryProdTasksStep()
      {
        mongoose.model('ProdTask')
          .find({fteMaster: true}, {name: 1})
          .sort({name: 1})
          .lean()
          .exec(this.next());
      },
      function handleProdTasksQueryResultStep(err, prodTasks)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var tasks = this.tasks;
        var functions = this.functions;

        prodTasks.forEach(function(prodTask)
        {
          tasks.push({
            type: 'prodTask',
            id: prodTask._id,
            name: prodTask.name,
            noPlan: false,
            functions: functions
          });
        });
      },
      function createFteMasterEntryStep()
      {
        var fteMasterEntryData = {
          division: shiftId.division,
          date: shiftId.date,
          shift: shiftId.no,
          tasks: this.tasks,
          locked: false,
          createdAt: new Date(),
          creator: user._id,
          creatorLabel: user.login,
          updatedAt: null,
          updater: null,
          updaterLabel: null
        };

        mongoose.model('FteMasterEntry').create(fteMasterEntryData, done);
      }
    );
  };

  fteMasterEntrySchema.statics.lock = function(_id, user, done)
  {
    this.findOne({_id: _id}, {tasks: 0}, function(err, fteMasterEntry)
    {
      if (err)
      {
        return done(err);
      }

      if (!fteMasterEntry)
      {
        return done(new Error('UNKNOWN'));
      }

      fteMasterEntry.lock(user, done);
    });
  };

  fteMasterEntrySchema.methods.lock = function(user, done)
  {
    if (this.get('locked'))
    {
      return done(new Error('LOCKED'));
    }

    this.set({
      updatedAt: new Date(),
      locked: true
    });

    if (user)
    {
      this.set({
        updater: user._id,
        updaterLabel: user.login
      });
    }

    this.save(function(err, fteMasterEntry)
    {
      if (err)
      {
        return done(err);
      }

      app.broker.publish('fte.master.locked', {
        user: user,
        model: {
          _id: fteMasterEntry.get('_id'),
          division: fteMasterEntry.get('division'),
          date: fteMasterEntry.get('date'),
          shift: fteMasterEntry.get('shift')
        }
      });

      done(null, fteMasterEntry);
    });
  };

  function getProdFlowsByDivisionId(divisionId, functions)
  {
    var prodFlows = [];

    app.subdivisions.models.forEach(function(subdivision)
    {
      if (subdivision.get('division') !== divisionId)
      {
        return;
      }

      var subdivisionId = subdivision.get('_id').toString();

      app.mrpControllers.models.forEach(function(mrpController)
      {
        if (String(mrpController.get('subdivision')) !== subdivisionId)
        {
          return;
        }

        var mrpControllerId = mrpController.get('_id');

        app.prodFlows.models.forEach(function(prodFlow)
        {
          if (prodFlow.get('mrpController') === mrpControllerId)
          {
            prodFlows.push({
              type: 'prodFlow',
              id: prodFlow.get('_id'),
              name: prodFlow.get('name'),
              functions: functions
            });
          }
        });
      });
    });

    return prodFlows;
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
