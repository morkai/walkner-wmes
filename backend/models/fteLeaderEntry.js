'use strict';

var step = require('h5.step');

module.exports = function setupFteLeaderEntryModel(app, mongoose)
{
  var fteLeaderTaskCompanySchema = mongoose.Schema({
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

  var fteLeaderTaskSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    companies: [fteLeaderTaskCompanySchema]
  }, {
    _id: false
  });

  var fteLeaderEntrySchema = mongoose.Schema({
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
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false
  });

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.statics.createForShift = function(shiftId, user, done)
  {
    step(
      function queryCompaniesStep()
      {
        mongoose.model('Company')
          .find({fteLeader: true}, {name: 1})
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

        this.companies = companies.map(function(company)
        {
          return {
            id: company._id,
            name: company.name,
            count: 0
          };
        });
      },
      function queryProdTasksStep()
      {
        mongoose.model('ProdTask')
          .find({fteLeader: true}, {name: 1})
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

        var companies = this.companies;

        this.prodTasks = prodTasks.map(function(prodTask)
        {
          return {
            id: prodTask._id,
            name: prodTask.name,
            companies: companies
          };
        });
      },
      function createFteLeaderEntryStep()
      {
        var fteLeaderEntryData = {
          subdivision: shiftId.subdivision,
          date: shiftId.date,
          shift: shiftId.no,
          tasks: this.prodTasks,
          createdAt: new Date(),
          creator: user._id,
          creatorLabel: user.login
        };

        mongoose.model('FteLeaderEntry').create(fteLeaderEntryData, done);
      }
    );
  };

  fteLeaderEntrySchema.statics.lock = function(_id, user, done)
  {
    this.findOne({_id: _id}, {tasks: 0}, function(err, fteLeaderEntry)
    {
      if (err)
      {
        return done(err);
      }

      if (!fteLeaderEntry)
      {
        return done(new Error('UNKNOWN'));
      }

      fteLeaderEntry.lock(user, done);
    });
  };

  fteLeaderEntrySchema.methods.lock = function(user, done)
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

    this.save(function(err, fteLeaderEntry)
    {
      if (err)
      {
        return done(err);
      }

      app.broker.publish('fte.leader.locked', {
        user: user,
        model: {
          _id: fteLeaderEntry.get('_id'),
          subdivision: fteLeaderEntry.get('subdivision'),
          date: fteLeaderEntry.get('date'),
          shift: fteLeaderEntry.get('shift')
        }
      });

      done(null, fteLeaderEntry);
    });
  };

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
