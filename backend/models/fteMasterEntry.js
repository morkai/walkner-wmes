// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setupFteMasterEntryModel(app, mongoose)
{
  const fteMasterTaskDemandSchema = new mongoose.Schema({
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
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const fteMasterTaskShortageSchema = new mongoose.Schema({
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
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

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
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const fteMasterTaskFunctionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    companies: [fteMasterTaskCompanySchema]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
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
    demand: [fteMasterTaskDemandSchema],
    functions: [fteMasterTaskFunctionSchema],
    shortage: [fteMasterTaskShortageSchema],
    totalDemand: {
      type: Number,
      default: null
    },
    total: {
      type: Number,
      default: null
    },
    totalShortage: {
      type: Number,
      default: null
    }
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const fteMasterAbsentUserSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true
    },
    personellId: String
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
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
    totalDemand: {
      type: Number,
      default: null
    },
    total: {
      type: Number,
      default: null
    },
    totalShortage: {
      type: Number,
      default: null
    },
    companyTotals: {},
    absenceTasks: {},
    tasks: [fteMasterTaskSchema],
    absentUsers: [fteMasterAbsentUserSchema]
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
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
   * @param {Object.<string, boolean>} options.absenceTasks
   * @param {Object} creator
   * @param {function(Error, FteMasterEntry)} done
   */
  fteMasterEntrySchema.statics.createForShift = function(options, creator, done)
  {
    const ProdTask = mongoose.model('ProdTask');
    const FteMasterEntry = mongoose.model('FteMasterEntry');
    const sortedCompanies = prepareSortedCompanies(options.structure);
    const demand = getProdFunctionCompanyEntries(sortedCompanies, sortedCompanies);
    const functions = options.structure.map(prodFunction => ({
      id: prodFunction.id,
      companies: getProdFunctionCompanyEntries(prodFunction.companies, sortedCompanies)
    }));

    step(
      function findModelsStep()
      {
        getProdFlowTasks(options.subdivision, demand, functions, this.parallel());

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

        const tasks = prodFlows.concat(prodTasks.map(prodTask => ({
          type: 'prodTask',
          id: prodTask._id,
          name: prodTask.name,
          noPlan: false,
          demand: [],
          functions,
          shortage: options.absenceTasks[prodTask._id] ? demand : [],
          totalDemand: 0,
          total: 0,
          totalShortage: 0
        })));
        const prevEntryValues = mapPrevEntryValues(prevFteEntry);

        this.tasks = prepareEntryTasks(tasks, prevEntryValues);
      },
      function createFteMasterEntryStep()
      {
        const absenceTasks = {};

        Object.keys(options.absenceTasks).forEach(taskId =>
        {
          const taskIndex = _.findIndex(this.tasks, task => task.id.toString() === taskId);

          if (taskIndex >= 0)
          {
            absenceTasks[taskId] = taskIndex;
          }
        });

        const fteMasterEntry = new FteMasterEntry({
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          totalDemand: 0,
          total: 0,
          totalShortage: 0,
          companyTotals: {},
          absenceTasks,
          tasks: this.tasks,
          createdAt: new Date(),
          creator,
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

  fteMasterEntrySchema.statics.calcTotals = function(entry)
  {
    if (!entry.tasks.length)
    {
      return;
    }

    const absenceTasks = entry.absenceTasks || {};
    const companyTotals = {
      total: {
        demand: 0,
        supply: 0,
        shortage: 0,
        absence: 0
      }
    };
    let overallTotalDemand = 0;
    let overallTotalSupply = 0;
    let overallTotalShortage = 0;

    _.forEach(entry.tasks[0].demand, demand =>
    {
      companyTotals[demand.id] = _.clone(companyTotals.total);
    });

    entry.tasks.forEach(task =>
    {
      task.totalDemand = 0;
      task.total = 0;
      task.totalShortage = 0;

      const prodFlow = task.type === 'prodFlow';
      const absenceTask = absenceTasks[task.id] >= 0;

      _.forEach(task.demand, taskDemand =>
      {
        const {id, count} = taskDemand;

        task.totalDemand += count;
        task.totalShortage += count;

        companyTotals.total.demand += count;
        companyTotals.total.shortage += count;
        companyTotals.total.absence += count;
        companyTotals[id].demand += count;
        companyTotals[id].shortage += count;
        companyTotals[id].absence += count;
      });

      task.functions.forEach(taskFunction =>
      {
        taskFunction.companies.forEach(taskCompany =>
        {
          const {id, count} = taskCompany;

          task.total += count;

          companyTotals.total.supply += count;
          companyTotals[id].supply += count;

          if (prodFlow)
          {
            task.totalShortage -= count;

            companyTotals.total.shortage -= count;
            companyTotals[id].shortage -= count;
          }

          if (prodFlow || absenceTask)
          {
            companyTotals.total.absence -= count;
            companyTotals[id].absence -= count;
          }
        });
      });

      overallTotalDemand += task.totalDemand;
      overallTotalSupply += task.total;
      overallTotalShortage += task.totalShortage;
    });

    entry.companyTotals = companyTotals;
    entry.totalDemand = overallTotalDemand;
    entry.total = overallTotalSupply;
    entry.totalShortage = overallTotalShortage;
  };

  fteMasterEntrySchema.methods.calcTotals = function()
  {
    this.constructor.calcTotals(this);
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

      if (change.demand)
      {
        if (!Array.isArray(task.demand))
        {
          return;
        }

        const demand = task.demand[change.companyIndex];

        if (!demand)
        {
          return;
        }

        const shortage = task.shortage[change.companyIndex];
        const oldCount = demand.count;
        const newCount = change.newValue > 0 ? change.newValue : 0;

        shortage.count += oldCount - newCount;
        demand.count = newCount;
      }
      else
      {
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

        const shortage = task.shortage[change.companyIndex];
        const oldCount = company.count;
        const newCount = change.newValue > 0 ? change.newValue : 0;

        if (shortage)
        {
          shortage.count -= oldCount - newCount;
        }

        company.count = newCount;
      }
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
          name: company.shortName || company.name,
          count: 0
        });
      }
    });

    return companies;
  }

  function prepareEntryTasks(tasks, prevEntryValues)
  {
    return _.map(tasks, task =>
    {
      task.noPlan = prevEntryValues[task.id] === true;
      task.demand = _.map(task.demand, demand =>
      {
        return {
          id: demand.id,
          name: demand.name,
          count: prevEntryValues[`demand:${task.id}:${demand.id}`] || 0
        };
      });
      task.functions = _.map(task.functions, taskFunction =>
      {
        return {
          id: taskFunction.id,
          companies: _.map(taskFunction.companies, taskCompany =>
          {
            return {
              id: taskCompany.id,
              name: taskCompany.name,
              count: prevEntryValues[`${task.id}:${taskFunction.id}:${taskCompany.id}`] || 0
            };
          })
        };
      });
      task.shortage = _.map(task.shortage, shortage =>
      {
        return {
          id: shortage.id,
          name: shortage.name,
          count: prevEntryValues[`shortage:${task.id}:${shortage.id}`] || 0
        };
      });

      return task;
    });
  }

  function getProdFlowTasks(subdivisionId, demand, functions, done)
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
          demand,
          functions,
          shortage: demand
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

    _.forEach(prevFteEntry.tasks, task =>
    {
      prevEntryValues[task.id] = task.noPlan;

      _.forEach(task.demand, demand =>
      {
        prevEntryValues[`demand:${task.id}:${demand.id}`] = demand.count;
      });

      _.forEach(task.functions, taskFunction =>
      {
        _.forEach(taskFunction.companies, taskCompany =>
        {
          prevEntryValues[`${task.id}:${taskFunction.id}:${taskCompany.id}`] = taskCompany.count;
        });
      });

      _.forEach(task.shortage, shortage =>
      {
        prevEntryValues[`shortage:${task.id}:${shortage.id}`] = shortage.count;
      });
    });

    return prevEntryValues;
  }

  function prepareSortedCompanies(structure)
  {
    const companies = {};

    [].concat(structure)
      .sort((a, b) => b.companies.length - a.companies.length)
      .forEach(prodFunction =>
      {
        _.forEach(prodFunction.companies, companyId => { companies[companyId] = true; });
      });

    return Object.keys(companies);
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
