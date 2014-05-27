// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
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
      function queryProdFlowsStep()
      {
        getProdFlowTasks(options.subdivision, this.functions, this.next());
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
        mongoose.model('ProdTask').getForSubdivision(options.subdivision, this.next());
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
            functions: functions,
            total: null
          });
        });
      },
      function createFteMasterEntryStep()
      {
        var fteMasterEntryData = {
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
        };

        mongoose.model('FteMasterEntry').create(fteMasterEntryData, done);
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

    this.tasks.forEach(function(task)
    {
      task.total = 0;

      task.functions.forEach(function(taskFunction)
      {
        taskFunction.companies.forEach(function(taskCompany)
        {
          task.total += taskCompany.count;
        });
      });

      overallTotal += task.total;
    });

    this.total = overallTotal;
  };

  fteMasterEntrySchema.methods.updateCount = function(options, updater, done)
  {
    var task = this.tasks[options.taskIndex];

    if (!task)
    {
      return done(new Error('INPUT'));
    }

    var prodFunction = task.functions[options.functionIndex];

    if (!prodFunction)
    {
      return done(new Error('INPUT'));
    }

    var company = prodFunction.companies[options.companyIndex];

    if (!company)
    {
      return done(new Error('INPUT'));
    }

    if (company.count === options.newCount)
    {
      return done();
    }

    company.count = options.newCount;

    this.markModified('tasks');
    this.calcTotals();
    this.set({
      updatedAt: new Date(),
      updater: updater
    });
    this.save(done);
  };

  fteMasterEntrySchema.methods.updatePlan = function(options, updater, done)
  {
    var task = lodash.find(this.tasks, function(task)
    {
      return String(task.id) === options.taskId;
    });

    if (!task)
    {
      return done(new Error('INPUT'));
    }

    if (task.noPlan === options.newValue)
    {
      return done();
    }

    if (options.newValue)
    {
      task.functions.forEach(function(prodFunction)
      {
        prodFunction.companies.forEach(function(company)
        {
          company.count = 0;
        });
      });
    }

    task.noPlan = options.newValue;

    this.markModified('tasks');
    this.calcTotals();
    this.set({
      updatedAt: new Date(),
      updater: updater
    });
    this.save(done);
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
        result.push({
          type: 'prodFlow',
          id: prodFlow.get('_id').toString(),
          name: prodFlow.get('name'),
          functions: functions
        });
      });

      done(null, result);
    });
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
