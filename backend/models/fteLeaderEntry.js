// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    createdAt: {
      type: Date,
      required: true
    },
    creator: {},
    updatedAt: {
      type: Date,
      default: null
    },
    updater: {},
    prodDivisionCount: {
      type: Number,
      required: true,
      min: 0
    },
    fteDiv: [String],
    totals: {},
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false
  });

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.index({date: -1});

  fteLeaderEntrySchema.statics.createForShift = function(options, creator, done)
  {
    var prodDivisions = app.divisions.models
      .filter(function(division) { return division.type === 'prod'; })
      .map(function(division) { return division._id; })
      .sort();

    step(
      function queryCompaniesStep()
      {
        mongoose.model('Company')
          .find({fteLeaderPosition: {$ne: -1}}, {name: 1})
          .sort({fteLeaderPosition: 1})
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
        mongoose.model('ProdTask').getForSubdivision(options.subdivision, this.next());
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
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          prodDivisionCount: prodDivisions.length,
          fteDiv: this.fteDiv ? prodDivisions : null,
          totals: null,
          tasks: this.prodTasks,
          createdAt: new Date(),
          creator: creator
        };

        mongoose.model('FteLeaderEntry').create(fteLeaderEntryData, done);
      }
    );
  };

  fteLeaderEntrySchema.methods.calcTotals = function()
  {
    var totals = {
      overall: 0
    };

    (this.fteDiv || []).forEach(function(divisionId)
    {
      totals[divisionId] = 0;
    });

    var keys = Object.keys(totals);

    this.tasks.forEach(function(task)
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

    this.totals = totals;
  };

  fteLeaderEntrySchema.methods.updateCount = function(options, updater, done)
  {
    var task = this.tasks[options.taskIndex];

    if (!task)
    {
      return done(new Error('INPUT'));
    }

    var company = task.companies[options.companyIndex];

    if (!company)
    {
      return done(new Error('INPUT'));
    }

    if (typeof options.divisionIndex === 'number')
    {
      var division = company.count[options.divisionIndex];

      if (!division)
      {
        return done(new Error('INPUT'));
      }

      division.value = options.newCount;
    }
    else
    {
      company.count = options.newCount;
    }

    this.markModified('tasks');
    this.calcTotals();
    this.set({
      updatedAt: new Date(),
      updater: updater
    });
    this.save(done);
  };

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
