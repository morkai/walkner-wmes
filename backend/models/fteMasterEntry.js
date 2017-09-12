// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setupFteMasterEntryModel(app, mongoose)
{
  const fteMasterTaskCompanySchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  }, {
    _id: false
  });

  const fteMasterTaskFunctionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    companies: [fteMasterTaskCompanySchema]
  }, {
    _id: false
  });

  const fteMasterTaskSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['prodTask', 'prodFlow']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true
    },
    noPlan: {
      type: Boolean,
      default: false
    },
    functions: [fteMasterTaskFunctionSchema],
    total: {
      type: Number,
      default: null
    }
  }, {
    _id: false
  });

  const fteMasterAbsentUserSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true
    },
    personellId: String
  }, {
    _id: false
  });

  const fteMasterEntrySchema = new mongoose.Schema({
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

  /**
   * @param {Object} options
   * @param {ObjectId} options.subdivision
   * @param {string} options.subdivisionType
   * @param {Date} options.date
   * @param {number} options.shift
   * @param {boolean} options.copy
   * @param {Array.<{id: string, companies: Array.<string>}>} options.structure
   * @param {Object} creator
   * @param {function(Error, FteMasterEntry)} done
   */
  fteMasterEntrySchema.statics.createForShift = function(options, creator, done)
  {
    const ProdTask = mongoose.model('ProdTask');
    const FteMasterEntry = mongoose.model('FteMasterEntry');
    const sortedCompanies = prepareSortedCompanies(options.structure);

    step(
      function prepareProdFunctionsStep()
      {
        this.functions = options.structure.map(function(prodFunction)
        {
          return {
            id: prodFunction.id,
            companies: getProdFunctionCompanyEntries(prodFunction.companies, sortedCompanies)
          };
        });
      },
      function findModelsStep()
      {
        getProdFlowTasks(options.subdivision, this.functions, this.parallel());

        ProdTask.getForSubdivision(options.subdivision, this.parallel());

        if (options.copy)
        {
          const conditions = {
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

        const functions = this.functions;
        const tasks = prodFlows.concat(prodTasks.map(prodTask => ({
          type: 'prodTask',
          id: prodTask._id,
          name: prodTask.name,
          noPlan: false,
          functions: functions,
          total: null
        })));
        const prevEntryValues = mapPrevEntryValues(prevFteEntry);

        this.tasks = prepareEntryTasks(tasks, prevEntryValues);
      },
      function createFteMasterEntryStep()
      {
        const fteMasterEntry = new FteMasterEntry({
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          total: null,
          tasks: this.tasks,
          createdAt: new Date(),
          creator: creator,
          updatedAt: null,
          updater: null
        });

        fteMasterEntry.calcTotals();
        fteMasterEntry.save(done);
      }
    );
  };

  fteMasterEntrySchema.statics.addAbsentUser = function(_id, absentUser, updater, done)
  {
    const update = {
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
    const update = {
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
    let overallTotal = 0;

    this.tasks.forEach(task =>
    {
      task.total = 0;

      task.functions.forEach(taskFunction =>
      {
        taskFunction.companies.forEach(taskCompany => { task.total += taskCompany.count; });
      });

      overallTotal += task.total;
    });

    this.total = overallTotal;
  };

  fteMasterEntrySchema.methods.applyChangeRequest = function(changes, updater)
  {
    const tasks = this.tasks;

    _.forEach(changes, function(change)
    {
      const task = tasks[change.taskIndex];

      if (!task)
      {
        return;
      }

      const func = task.functions[change.functionIndex];

      if (!func)
      {
        return;
      }

      const company = func.companies[change.companyIndex];

      if (!company)
      {
        return;
      }

      company.count = change.newValue > 0 ? change.newValue : 0;
    });

    if (updater)
    {
      this.updater = updater;
      this.updatedAt = new Date();
    }
  };

  function getProdFunctionCompanyEntries(prodFunctionCompanies, sortedCompanies)
  {
    const companies = [];

    _.forEach(sortedCompanies, function(companyId)
    {
      if (!_.includes(prodFunctionCompanies, companyId))
      {
        return;
      }

      const company = app.companies.modelsById[companyId];

      if (company)
      {
        companies.push({
          id: company._id,
          name: company.name,
          count: 0
        });
      }
    });

    return companies;
  }

  function prepareEntryTasks(tasks, prevEntryValues)
  {
    return _.map(tasks, function(task)
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
              count: prevEntryValues[`${task.id}:${taskFunction.id}:${taskCompany.id}`] || 0
            };
          })
        };
      });

      return task;
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

      const result = [];

      _.forEach(prodFlows, function(prodFlow)
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

      result.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

      done(null, result);
    });
  }

  function mapPrevEntryValues(prevFteEntry)
  {
    const prevEntryValues = {};

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
          prevEntryValues[`${task.id}:${taskFunction.id}:${taskCompany.id}`] = taskCompany.count;
        });
      });
    });

    return prevEntryValues;
  }

  function prepareSortedCompanies(structure)
  {
    const companies = {};

    [].concat(structure)
      .sort((a, b) => b.companies.length - a.companies.length)
      .forEach(function(prodFunction)
      {
        _.forEach(prodFunction.companies, companyId => { companies[companyId] = true; });
      });

    return Object.keys(companies);
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
