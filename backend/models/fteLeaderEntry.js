'use strict';

var step = require('h5.step');

module.exports = function setupFteLeaderEntryModel(app, mongoose)
{
  var fteLeaderTaskCompanySchema = mongoose.Schema({
    id: String,
    name: String,
    count: {}
  }, {
    _id: false
  });

  fteLeaderTaskCompanySchema.path('count').validate(
    function(value)
    {
      if (typeof value === 'number')
      {
        return value >= 0;
      }

      return Array.isArray(value) && !value.some(function(el)
      {
        return !el
          || typeof el !== 'object'
          || typeof el.division !== 'string'
          || typeof el.value !== 'number'
          || el.value < 0;
      });
    },
    'INVALID_COUNT'
  );

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
    fteDiv: [String],
    totals: {},
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false
  });

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.statics.createForShift = function(shiftId, user, done)
  {
    var prodDivisions = app.divisions.models
      .filter(function(division) { return division.type === 'prod'; })
      .map(function(division) { return division.get('_id'); })
      .sort();

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
        mongoose.model('ProdTask').getForSubdivision(shiftId.subdivision, this.next());
      },
      function handleProdTasksQueryResultStep(err, prodTasks)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var ctx = this;

        this.prodTasks = prodTasks.map(function(prodTask)
        {
          ctx.fteDiv = ctx.fteDiv || prodTask.fteDiv;

          return {
            id: prodTask._id,
            name: prodTask.name,
            companies: !prodTask.fteDiv ? ctx.companies : ctx.companies.map(function(company)
            {
              return {
                id: company.id,
                name: company.name,
                count: prodDivisions.map(function(prodDivision)
                {
                  return {
                    division: prodDivision,
                    value: 0
                  };
                })
              };
            })
          };
        });
      },
      function createFteLeaderEntryStep()
      {
        var fteLeaderEntryData = {
          subdivision: shiftId.subdivision,
          date: shiftId.date,
          shift: shiftId.no,
          fteDiv: this.fteDiv ? prodDivisions : null,
          totals: null,
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
    this.findOne({_id: _id}, function(err, fteLeaderEntry)
    {
      if (err)
      {
        return done(err);
      }

      if (!fteLeaderEntry)
      {
        return done(new Error('UNKNOWN'));
      }

      if (fteLeaderEntry.get('locked'))
      {
        return done(new Error('LOCKED'));
      }

      fteLeaderEntry.lock(user, done);
    });
  };

  fteLeaderEntrySchema.methods.lock = function(user, done)
  {
    this.set({
      updatedAt: new Date(),
      locked: true,
      totals: calcTotals(this)
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

  function calcTotals(fteLeaderEntry)
  {
    var totals = {
      overall: 0
    };

    (fteLeaderEntry.fteDiv || []).forEach(function(divisionId)
    {
      totals[divisionId] = 0;
    });

    var keys = Object.keys(totals);

    fteLeaderEntry.tasks.forEach(function(task)
    {
      task.companies.forEach(function(fteCompany)
      {
        var count = fteCompany.count;

        if (Array.isArray(count))
        {
          count.forEach(function(divisionCount)
          {
            totals.overall += divisionCount.value;
            totals[divisionCount.division] += divisionCount.value;
          });
        }
        else if (typeof count === 'number')
        {
          keys.forEach(function(key) { totals[key] += count; });
        }
      });
    });

    return totals;
  }

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
