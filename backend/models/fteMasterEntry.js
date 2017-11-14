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
    functions: [fteMasterTaskFunctionSchema],
    total: {
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
    total: {
      type: Number,
      default: null
    },
    totals: {},
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
    const FteMasterEntry = mongoose.model('FteMasterEntry');
    const sortedCompanies = prepareSortedCompanies(options.structure);
    const functions = options.structure.map(prodFunction => ({
      id: prodFunction.id,
      companies: getProdFunctionCompanyEntries(prodFunction.companies, sortedCompanies)
    }));

    step(
      function findModelsStep()
      {
        getProdFlowTasks(options.subdivision, functions, this.parallel());

        getProdTaskTasks(options.subdivision, functions, options.absenceTasks, this.parallel());

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

        const tasks = prodFlows.concat(prodTasks);
        const prevEntryValues = mapPrevEntryValues(prevFteEntry);

        this.tasks = prepareEntryTasks(tasks, prevEntryValues);
        this.totals = prevFteEntry ? prevFteEntry.totals : null;
      },
      function createFteMasterEntryStep()
      {
        const fteMasterEntry = new FteMasterEntry({
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          total: 0,
          totals: this.totals,
          absenceTasks: prepareAbsenceTasks(options.absenceTasks, this.tasks),
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

  fteMasterEntrySchema.statics.calcTotals = function(entry, skipNoPlan)
  {
    const firstTask = entry.tasks[0];

    if (!firstTask)
    {
      return;
    }

    const companyMap = {};

    firstTask.functions.forEach(taskFunction =>
    {
      taskFunction.companies.forEach(taskCompany =>
      {
        companyMap[taskCompany.id] = 1;
      });
    });

    const companyList = Object.keys(companyMap);

    if (!entry.totals)
    {
      entry.totals = prepareEntryTotals(companyList);
    }

    const totals = entry.totals;

    totals.demand.total = 0;

    companyList.forEach(companyId =>
    {
      if (!totals.demand[companyId])
      {
        totals.demand[companyId] = 0;
      }

      totals.demand.total += totals.demand[companyId];

      totals.supply.total = 0;
      totals.supply[companyId] = 0;

      totals.shortage.total = 0;
      totals.shortage[companyId] = 0;

      totals.absence.total = 0;
      totals.absence[companyId] = 0;
    });

    entry.tasks.forEach(task =>
    {
      if (task.noPlan && skipNoPlan)
      {
        return;
      }

      const absenceTask = entry.absenceTasks[task.id] >= 0;

      task.total = 0;

      task.functions.forEach(taskFunction =>
      {
        taskFunction.companies.forEach(({id, count}) =>
        {
          task.total += count;

          if (absenceTask)
          {
            if (totals.demand.total > 0)
            {
              totals.absence.total += count;
              totals.absence[id] += count;
            }
          }
          else
          {
            totals.supply.total += count;
            totals.supply[id] += count;
          }
        });
      });
    });

    if (totals.demand.total > 0)
    {
      totals.shortage.total = totals.demand.total - totals.supply.total;
      totals.absence.total = totals.shortage.total - totals.absence.total;

      companyList.forEach(companyId =>
      {
        totals.shortage[companyId] = totals.demand[companyId] - totals.supply[companyId];
        totals.absence[companyId] = totals.shortage[companyId] - totals.absence[companyId];
      });
    }

    entry.total = totals.supply.total;

    if (entry.markModified)
    {
      entry.markModified('totals');
    }
  };

  fteMasterEntrySchema.methods.calcTotals = function()
  {
    this.constructor.calcTotals(this);
  };

  fteMasterEntrySchema.methods.applyChangeRequest = function(changes, updater)
  {
    changes.forEach(change =>
    {
      if (change.newValue < 0)
      {
        return;
      }

      if (change.kind === 'demand')
      {
        this.totals.demand[change.companyId] = change.newValue;

        this.markModified('totals');

        return;
      }

      const task = this.tasks[change.taskIndex];

      if (!task)
      {
        return;
      }

      task.noPlan = false;

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

      company.count = change.newValue;
    });

    if (updater)
    {
      this.updater = updater;
      this.updatedAt = new Date();
    }
  };

  function getProdFunctionCompanyEntries(prodFunctionCompanies, sortedCompanies)
  {
    return sortedCompanies
      .filter(c => prodFunctionCompanies.includes(c))
      .map(c => app.companies.modelsById[c])
      .filter(c => !!c)
      .map(c => ({
        id: c._id,
        name: c.shortName || c.name,
        count: 0
      }));
  }

  function prepareEntryTasks(tasks, prevEntryValues)
  {
    return tasks.map(task =>
    {
      task.noPlan = prevEntryValues[task.id] === true;

      task.functions = task.functions.map(taskFunction =>
      {
        return {
          id: taskFunction.id,
          companies: taskFunction.companies.map(taskCompany =>
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
    mongoose.model('ProdFlow').getAllBySubdivisionId(subdivisionId, (err, prodFlows) =>
    {
      if (err)
      {
        return done(err);
      }

      const result = prodFlows.filter(p => !p.deactivatedAt).map(p => ({
        type: 'prodFlow',
        id: p._id,
        name: p.name,
        noPlan: false,
        functions,
        total: 0
      }));

      result.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

      done(null, result);
    });
  }

  function getProdTaskTasks(subdivisionId, functions, absenceTasks, done)
  {
    mongoose.model('ProdTask').getForSubdivision(subdivisionId, (err, prodTasks) =>
    {
      if (err)
      {
        return done(err);
      }

      const result = prodTasks.map(prodTask => ({
        type: 'prodTask',
        id: prodTask._id,
        name: prodTask.name,
        noPlan: false,
        functions,
        total: 0
      }));

      result.sort((a, b) =>
      {
        const aAbsenceTask = absenceTasks[a.id];
        const bAbsenceTask = absenceTasks[b.id];

        if (aAbsenceTask === bAbsenceTask)
        {
          return a.name.localeCompare(b.name, undefined, {numeric: true});
        }

        return aAbsenceTask && !bAbsenceTask ? -1 : 1;
      });

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

      _.forEach(task.functions, taskFunction =>
      {
        _.forEach(taskFunction.companies, taskCompany =>
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
      .forEach(prodFunction =>
      {
        _.forEach(prodFunction.companies, companyId => { companies[companyId] = true; });
      });

    return Object.keys(companies);
  }

  function prepareAbsenceTasks(absenceTasks, tasks)
  {
    const absenceTaskToIndexMap = {};

    Object.keys(absenceTasks).forEach(taskId =>
    {
      const taskIndex = _.findIndex(tasks, task => task.id.toString() === taskId);

      if (taskIndex >= 0)
      {
        absenceTaskToIndexMap[taskId] = taskIndex;
      }
    });

    return absenceTaskToIndexMap;
  }

  function prepareEntryTotals(sortedCompanies)
  {
    const totals = {
      demand: {
        total: 0
      },
      supply: {
        total: 0
      },
      shortage: {
        total: 0
      },
      absence: {
        total: 0
      }
    };

    sortedCompanies.forEach(companyId =>
    {
      totals.demand[companyId] = 0;
      totals.supply[companyId] = 0;
      totals.shortage[companyId] = 0;
      totals.absence[companyId] = 0;
    });

    return totals;
  }

  mongoose.model('FteMasterEntry', fteMasterEntrySchema);
};
