// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setupFteLeaderEntryModel(app, mongoose)
{
  const fteLeaderTaskCompanySchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    count: {}
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
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

  const fteLeaderTaskFunctionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    companies: [fteLeaderTaskCompanySchema]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const fteLeaderTaskSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    childCount: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      required: true
    },
    companies: [fteLeaderTaskCompanySchema],
    functions: [fteLeaderTaskFunctionSchema],
    totals: {},
    comment: String
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const fteLeaderEntrySchema = new mongoose.Schema({
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
    absenceTasks: {},
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
  });

  fteLeaderEntrySchema.index({subdivision: 1});
  fteLeaderEntrySchema.index({date: -1, subdivision: 1});

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.statics.mapProdTasks = mapProdTasks;

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
   * @param {function(Error, FteLeaderEntry)} done
   */
  fteLeaderEntrySchema.statics.createForShift = function(options, creator, done)
  {
    const ProdTask = mongoose.model('ProdTask');
    const FteLeaderEntry = mongoose.model('FteLeaderEntry');
    const prodDivisions = app.divisions.models
      .filter(division => division.type === 'prod' && !division.deactivatedAt)
      .map(division => division._id)
      .sort();
    const sortedCompanies = prepareSortedCompanies(options.structure);
    const functions = options.structure.map(prodFunction => ({
      id: prodFunction.id,
      companies: getProdFunctionCompanyEntries(prodFunction.companies, sortedCompanies)
    }));

    step(
      function findModelsStep()
      {
        ProdTask.getForSubdivision(options.subdivision, this.parallel());

        if (options.copy)
        {
          const conditions = {
            subdivision: options.subdivision,
            date: {$lt: options.date},
            shift: options.shift
          };

          FteLeaderEntry
            .findOne(conditions, {tasks: 1})
            .sort({date: -1})
            .lean()
            .exec(this.parallel());
        }
      },
      function prepareEntryTasksStep(err, prodTasks, prevFteEntry)
      {
        if (err)
        {
          return this.done(done, err);
        }

        const options = {
          fteDiv: false,
          functions,
          prodDivisions,
          prodTaskMaps: mapProdTasks(prodTasks),
          prevEntryValues: mapPrevEntryValues(prevFteEntry)
        };

        this.tasks = prepareEntryTasks(prodTasks, options);
        this.fteDiv = options.fteDiv;

        const idToTask = {};
        const idToChildCount = {};

        this.tasks.forEach(task =>
        {
          idToTask[task.id] = task;

          if (task.parent)
          {
            if (idToChildCount[task.parent] === undefined)
            {
              idToChildCount[task.parent] = 1;
            }
            else
            {
              idToChildCount[task.parent] += 1;
            }
          }
        });

        _.forEach(idToChildCount, (childCount, taskId) =>
        {
          idToTask[taskId].childCount = childCount;
        });
      },
      function createFteLeaderEntryStep()
      {
        const fteLeaderEntry = new FteLeaderEntry({
          subdivision: options.subdivision,
          date: options.date,
          shift: options.shift,
          prodDivisionCount: prodDivisions.length,
          fteDiv: this.fteDiv ? prodDivisions : null,
          totals: null,
          absenceTasks: prepareAbsenceTasks(options.absenceTasks, this.tasks),
          tasks: this.tasks,
          createdAt: new Date(),
          creator,
          updatedAt: null,
          updater: null
        });

        fteLeaderEntry.calcTotals();
        fteLeaderEntry.save(done);
      }
    );
  };

  fteLeaderEntrySchema.statics.calcTotals = function(entry)
  {
    const firstTask = entry.tasks[0];

    if (!firstTask)
    {
      return;
    }

    const companyMap = {};

    if (Array.isArray(firstTask.companies) && firstTask.companies.length)
    {
      firstTask.companies.forEach(taskCompany =>
      {
        companyMap[taskCompany.id] = 1;
      });
    }
    else
    {
      firstTask.functions.forEach(taskFunction =>
      {
        taskFunction.companies.forEach(taskCompany =>
        {
          companyMap[taskCompany.id] = 1;
        });
      });
    }

    const companyList = Object.keys(companyMap);
    const totalsKeys = ['overall'].concat(entry.fteDiv || []);

    if (!entry.totals || !entry.totals.supply)
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
      const childTask = task.childCount === 0;
      const absenceTask = entry.absenceTasks[task.id] >= 0;

      task.totals = {};

      totalsKeys.forEach(k => { task.totals[k] = 0; });

      if (Array.isArray(task.functions) && task.functions.length)
      {
        task.functions.forEach(taskFunction => calcCompaniesTotals(
          absenceTask, taskFunction.companies, task.totals, childTask ? totals : null
        ));
      }
      else
      {
        calcCompaniesTotals(absenceTask, task.companies, task.totals, childTask ? totals : null);
      }
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

    if (entry.markModified)
    {
      entry.markModified('totals');
    }

    function calcCompaniesTotals(absenceTask, taskCompanies, taskTotals, overallTotals)
    {
      taskCompanies.forEach(fteCompany =>
      {
        calcCompanyTotals(absenceTask, fteCompany, taskTotals, overallTotals);
      });
    }

    function calcCompanyTotals(absenceTask, fteCompany, taskTotals, overallTotals)
    {
      const count = fteCompany.count;

      if (Array.isArray(count))
      {
        count.forEach(divisionCount =>
        {
          const {division, value} = divisionCount;

          taskTotals.overall += value;
          taskTotals[division] += value;

          if (!overallTotals)
          {
            return;
          }

          if (absenceTask)
          {
            if (overallTotals.demand.total > 0)
            {
              overallTotals.absence.total += value;
              overallTotals.absence[fteCompany.id] += value;
            }

            return;
          }

          overallTotals.supply.total += value;
          overallTotals.supply[fteCompany.id] += value;
        });

        return;
      }

      if (typeof count !== 'number')
      {
        return;
      }

      totalsKeys.forEach(key =>
      {
        taskTotals[key] += count;
      });

      if (absenceTask)
      {
        if (overallTotals && overallTotals.demand.total > 0)
        {
          overallTotals.absence.total += count;
          overallTotals.absence[fteCompany.id] += count;
        }

        return;
      }

      if (overallTotals)
      {
        overallTotals.supply.total += count;
        overallTotals.supply[fteCompany.id] += count;
      }
    }
  };

  fteLeaderEntrySchema.methods.calcTotals = function()
  {
    this.constructor.calcTotals(this);
  };

  fteLeaderEntrySchema.methods.applyChangeRequest = function(changes, updater)
  {
    let divisionModified = false;

    _.forEach(changes, change =>
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

      const newValue = change.newValue > 0 ? change.newValue : 0;

      if (_.isArray(company.count) && company.count[change.divisionIndex])
      {
        company.count[change.divisionIndex].value = newValue;
        divisionModified = true;
      }
      else if (_.isNumber(company.count) && change.divisionIndex === -1)
      {
        company.count = newValue;
      }
    });

    if (divisionModified)
    {
      this.markModified('tasks');
    }

    if (updater)
    {
      this.updater = updater;
      this.updatedAt = new Date();
    }
  };

  function prepareEntryTasks(prodTasks, options)
  {
    return prodTasks
      .map(prodTask => prepareEntryTask(prodTask, options))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function prepareEntryTask(prodTask, options)
  {
    options.fteDiv = options.fteDiv || prodTask.fteDiv;

    return {
      id: prodTask._id,
      parent: prodTask.parent || null,
      childCount: 0,
      name: prodTask.name,
      companies: [],
      functions: _.map(options.functions, functionEntry =>
      {
        return {
          id: functionEntry.id,
          companies: _.map(functionEntry.companies, companyEntry =>
          {
            const key = `${prodTask._id}:${functionEntry.id}:${companyEntry.id}`;
            let count = 0;

            if (!prodTask.fteDiv && !isAnyChildFteDivided(prodTask, options.prodTaskMaps))
            {
              count = options.prevEntryValues[key] || 0;
            }
            else
            {
              const prevCountPerDivision = (options.prevEntryValues[key] || 0) / options.prodDivisions.length;

              count = _.map(options.prodDivisions, prodDivision =>
              {
                const value = options.prevEntryValues[`${key}:${prodDivision}`];

                return {
                  division: prodDivision,
                  value: value === undefined ? prevCountPerDivision : value
                };
              });
            }

            return {
              id: companyEntry.id,
              name: companyEntry.name,
              count: count
            };
          })
        };
      }),
      totals: null
    };
  }

  function getProdFunctionCompanyEntries(prodFunctionCompanies, sortedCompanies)
  {
    const companies = [];

    _.forEach(sortedCompanies, companyId =>
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

  function mapProdTasks(tasks)
  {
    const idToTask = {};
    const idToChildren = {};
    const idToIndex = {};

    for (let i = 0; i < tasks.length; ++i)
    {
      const task = tasks[i];

      idToTask[task.id] = task;
      idToIndex[task.id] = i;

      if (!task.parent)
      {
        continue;
      }

      const parentId = task.parent.toString();

      if (idToChildren[parentId])
      {
        idToChildren[parentId].push(task);
      }
      else
      {
        idToChildren[parentId] = [task];
      }
    }

    return {
      idToTask: idToTask,
      idToChildren: idToChildren,
      idToIndex: idToIndex
    };
  }

  function mapPrevEntryValues(prevFteEntry)
  {
    const prevEntryValues = {};

    if (!prevFteEntry)
    {
      return prevEntryValues;
    }

    _.forEach(prevFteEntry.tasks, task => mapPrevEntryTask(prevEntryValues, task));

    return prevEntryValues;
  }

  function mapPrevEntryTask(prevEntryValues, task)
  {
    _.forEach(task.functions, taskFunction => mapPrevEntryTaskFunction(prevEntryValues, task, taskFunction));
  }

  function mapPrevEntryTaskFunction(prevEntryValues, task, taskFunction)
  {
    _.forEach(
      taskFunction.companies,
      taskCompany => mapPrevEntryTaskCompany(prevEntryValues, task, taskFunction, taskCompany)
    );
  }

  function mapPrevEntryTaskCompany(prevEntryValues, task, taskFunction, taskCompany)
  {
    const count = taskCompany.count;
    const key = `${task.id}:${taskFunction.id}:${taskCompany.id}`;

    if (Array.isArray(count))
    {
      prevEntryValues[key] = 0;

      _.forEach(count, function(divisionCount)
      {
        prevEntryValues[key] += divisionCount.value;
        prevEntryValues[`${key}:${divisionCount.division}`] = divisionCount.value;
      });
    }
    else
    {
      prevEntryValues[key] = count;
    }
  }

  function isAnyChildFteDivided(prodTask, prodTaskMaps)
  {
    const childProdTasks = prodTaskMaps.idToChildren[prodTask._id];

    if (!childProdTasks || !childProdTasks.length)
    {
      return false;
    }

    for (let i = 0; i < childProdTasks.length; ++i)
    {
      const childProdTask = childProdTasks[i];

      if (childProdTask.fteDiv || isAnyChildFteDivided(childProdTask, prodTaskMaps))
      {
        return true;
      }
    }

    return false;
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

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
