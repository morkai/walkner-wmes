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

  var fteMasterAbsentUserSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    personellId: String
  }, {
    _id: false
  });

  var fteMasterEntrySchema = mongoose.Schema({
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
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
    total: {
      type: Number,
      default: null
    },
    tasks: [fteMasterTaskSchema],
    absentUsers: [fteMasterAbsentUserSchema]
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
        getProdFlowTasks(shiftId.subdivision, this.functions, this.next());
      },
      function handleProdFlowsQueryResultStep(err, prodFlows)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.tasks = prodFlows;
      },
      function queryProdTasksStep()
      {
        mongoose.model('ProdTask').getForSubdivision(shiftId.subdivision, this.next());
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
          subdivision: shiftId.subdivision,
          date: shiftId.date,
          shift: shiftId.no,
          total: null,
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
    this.findOne({_id: _id}, function(err, fteMasterEntry)
    {
      if (err)
      {
        return done(err);
      }

      if (!fteMasterEntry)
      {
        return done(new Error('UNKNOWN'));
      }

      if (fteMasterEntry.get('locked'))
      {
        return done(new Error('LOCKED'));
      }

      fteMasterEntry.lock(user, done);
    });
  };

  fteMasterEntrySchema.statics.addAbsentUser = function(_id, absentUser, user, done)
  {
    var update = {
      $set: {
        updatedAt: new Date()
      },
      $push: {
        absentUsers: absentUser
      }
    };

    if (user)
    {
      update.$set.updater = user._id;
      update.$set.updaterLabel = user.login;
    }

    this.update({_id: _id}, update, done);
  };

  fteMasterEntrySchema.statics.removeAbsentUser = function(_id, absentUserId, user, done)
  {
    var update = {
      $set: {
        updatedAt: new Date()
      },
      $pull: {
        absentUsers: {id: absentUserId}
      }
    };

    if (user)
    {
      update.$set.updater = user._id;
      update.$set.updaterLabel = user.login;
    }

    this.update({_id: _id}, update, done);
  };

  fteMasterEntrySchema.methods.lock = function(user, done)
  {
    this.set({
      updatedAt: new Date(),
      locked: true,
      total: calcTotal(this)
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
          subdivision: fteMasterEntry.get('subdivision'),
          date: fteMasterEntry.get('date'),
          shift: fteMasterEntry.get('shift')
        }
      });

      done(null, fteMasterEntry);
    });
  };

  function calcTotal(fteMasterEntry)
  {
    var total = 0;

    fteMasterEntry.tasks.forEach(function(task)
    {
      task.functions.forEach(function(taskFunction)
      {
        taskFunction.companies.forEach(function(taskCompany)
        {
          total += taskCompany.count;
        });
      });
    });

    return total;
  }

  function getProdFlowTasks(subdivisionId, functions, done)
  {
    mongoose.model('ProdFlow').getAllBySubdivisionId(subdivisionId, function(err, prodFlows)
    {
      if (err)
      {
        return done(err);
      }

      var idMap = {};
      var result = [];

      prodFlows.forEach(function(prodFlow)
      {
        var id = prodFlow.get('_id');
        var idStr = id.toString();

        if (typeof idMap[idStr] === 'undefined')
        {
          result.push({
            type: 'prodFlow',
            id: id,
            name: prodFlow.get('name'),
            functions: functions
          });

          idMap[idStr] = true;
        }
      });

      done(null, result);
    });
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
