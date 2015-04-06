// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
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
    functions: [fteMasterTaskFunctionSchema],
    total: {
      type: Number,
      default: null
    }
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

  fteMasterEntrySchema.index({subdivision: 1});
  fteMasterEntrySchema.index({date: -1, subdivision: 1});

  fteMasterEntrySchema.statics.createForShift = function(options, creator, done)
  {
    var ProdTask = mongoose.model('ProdTask');
    var FteMasterEntry = mongoose.model('FteMasterEntry');

    step(
      function prepareProdFunctionsStep()
      {
        this.functions = app.prodFunctions.models
          .filter(function(prodFunction)
          {
            return prodFunction.fteMasterPosition > -1;
          })
          .sort(function(a, b) { return a.fteMasterPosition - b.fteMasterPosition; })
          .map(function(prodFunction)
          {
            return {
              id: prodFunction._id,
              companies: getProdFunctionCompanyEntries(prodFunction)
            };
          })
          .filter(function(functionEntry)
          {
            return functionEntry.companies.length > 0;
          });
      },
      function findModelsStep()
      {
        getProdFlowTasks(options.subdivision, this.functions, this.parallel());

        ProdTask.getForSubdivision(options.subdivision, this.parallel());

        if (options.copy)
        {
          var conditions = {
            subdivision: options.subdivision,
            date: {$lt: options.date},
            shift: options.shift
          };

          FteMasterEntry
            .findOne(conditions, {tasks: 1})
            .sort({date: -1})
            .lean()
            .exec(this.parallel());
        }
      },
      function prepareEntryTasksStep(err, prodFlows, prodTasks, prevFteEntry)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var tasks = prodFlows;
        var functions = this.functions;
        var prevEntryValues = mapPrevEntryValues(prevFteEntry);

        _.forEach(prodTasks, function(prodTask)
        {
          tasks.push({
            type: 'prodTask',
            id: prodTask._id,
            name: prodTask.name,
            noPlan: false,
            functions: functions,
            total: null
          });
        });

        this.tasks = _.map(tasks, function(task)
        {
          task.noPlan = prevEntryValues[task.id] === true;
          task.functions = _.map(task.functions, function(taskFunction)
          {
            return {
              id: taskFunction.id,
              companies: _.map(taskFunction.companies, function(taskCompany)
              {
                return {
                  id: taskCompany.id,
                  name: taskCompany.name,
                  count: prevEntryValues[task.id + ':' + taskFunction.id + ':' + taskCompany.id] || 0
                };
              })
            };
          });

          return task;
        });
      },
      function createFteMasterEntryStep()
      {
        var fteMasterEntry = new FteMasterEntry({
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          total: null,
          tasks: this.tasks,
          locked: false,
          createdAt: new Date(),
          creator: creator,
          updatedAt: null,
          updater: null
        });
        
        if (options.copy)
        {
          fteMasterEntry.calcTotals();
        }

        fteMasterEntry.save(done);
      }
    );
  };

  fteMasterEntrySchema.statics.addAbsentUser = function(_id, absentUser, updater, done)
  {
    var update = {
      $set: {
        updatedAt: new Date(),
        updater: updater
      },
      $push: {
        absentUsers: absentUser
      }
    };

    this.update({_id: _id}, update, done);
  };

  fteMasterEntrySchema.statics.removeAbsentUser = function(_id, absentUserId, updater, done)
  {
    var update = {
      $set: {
        updatedAt: new Date(),
        updater: updater
      },
      $pull: {
        absentUsers: {id: absentUserId}
      }
    };

    this.update({_id: _id}, update, done);
  };

  fteMasterEntrySchema.methods.calcTotals = function()
  {
    var overallTotal = 0;

    for (var i = 0, l = this.tasks.length; i < l; ++i)
    {
      var task = this.tasks[i];

      task.total = 0;

      for (var ii = 0, ll = task.functions.length; ii < ll; ++ii)
      {
        var taskFunction = task.functions[ii];

        for (var iii = 0, lll = taskFunction.companies.length; iii < lll; ++iii)
        {
          task.total += taskFunction.companies[iii].count;
        }
      }

      overallTotal += task.total;
    }

    this.total = overallTotal;
  };

  function getProdFunctionCompanyEntries(prodFunction)
  {
    var companies = [];

    prodFunction.companies.forEach(function(companyId)
    {
      var company = app.companies.modelsById[companyId];

      if (company && company.fteMasterPosition > -1)
      {
        companies.push(company);
      }
    });

    return companies
      .sort(function(a, b) { return a.fteMasterPosition - b.fteMasterPosition; })
      .map(function(company)
      {
        return {
          id: company._id,
          name: company.name,
          count: 0
        };
      });
  }

  function getProdFlowTasks(subdivisionId, functions, done)
  {
    mongoose.model('ProdFlow').getAllBySubdivisionId(subdivisionId, function(err, prodFlows)
    {
      if (err)
      {
        return done(err);
      }

      var result = [];

      prodFlows.forEach(function(prodFlow)
      {
        if (prodFlow.deactivatedAt)
        {
          return;
        }

        result.push({
          type: 'prodFlow',
          id: prodFlow._id.toString(),
          name: prodFlow.name,
          functions: functions
        });
      });

      done(null, result);
    });
  }

  function mapPrevEntryValues(prevFteEntry)
  {
    var prevEntryValues = {};

    if (!prevFteEntry)
    {
      return prevEntryValues;
    }

    _.forEach(prevFteEntry.tasks, function(task)
    {
      prevEntryValues[task.id] = task.noPlan;

      _.forEach(task.functions, function(taskFunction)
      {
        _.forEach(taskFunction.companies, function(taskCompany)
        {
          prevEntryValues[task.id + ':' + taskFunction.id + ':' + taskCompany.id] = taskCompany.count;
        });
      });
    });

    return prevEntryValues;
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
