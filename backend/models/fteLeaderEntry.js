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

  const fteLeaderTaskFunctionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    companies: [fteLeaderTaskCompanySchema]
  }, {
    _id: false
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
    _id: false
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
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false
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
   * @param {Object} creator
   * @param {function(Error, FteLeaderEntry)} done
   */
  fteLeaderEntrySchema.statics.createForShift = function(options, creator, done)
  {
    const ProdTask = mongoose.model('ProdTask');
    const FteLeaderEntry = mongoose.model('FteLeaderEntry');
    const prodDivisions = app.divisions.models
      .filter(function(division) { return division.type === 'prod' && !division.deactivatedAt; })
      .map(function(division) { return division._id; })
      .sort();
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
          functions: this.functions,
          prodDivisions: prodDivisions,
          prodTaskMaps: mapProdTasks(prodTasks),
          prevEntryValues: mapPrevEntryValues(prevFteEntry)
        };

        this.tasks = prepareEntryTasks(prodTasks, options);
        this.fteDiv = options.fteDiv;

        const idToTask = {};
        const idToChildCount = {};

        _.forEach(this.tasks, function(task)
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

        _.forEach(idToChildCount, function(childCount, taskId)
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
          tasks: this.tasks,
          createdAt: new Date(),
          creator: creator
        });

        fteLeaderEntry.calcTotals();
        fteLeaderEntry.save(done);
      }
    );
  };

  fteLeaderEntrySchema.methods.calcTotals = function()
  {
    const overallTotals = {overall: 0};
    const fteDiv = this.fteDiv || [];

    _.forEach(fteDiv, divisionId => { overallTotals[divisionId] = 0; });

    const totalsKeys = Object.keys(overallTotals);

    _.forEach(this.tasks, function(task)
    {
      task.totals = {};

      _.forEach(totalsKeys, key => { task.totals[key] = 0; });

      if (Array.isArray(task.functions) && task.functions.length)
      {
        _.forEach(
          task.functions,
          taskFunction => calcCompaniesTotals(totalsKeys, taskFunction.companies, task.totals, overallTotals)
        );
      }
      else
      {
        calcCompaniesTotals(totalsKeys, task.companies, task.totals, overallTotals);
      }
    });

    this.totals = overallTotals;
  };

  function calcCompaniesTotals(totalsKeys, taskCompanies, taskTotals, overallTotals)
  {
    _.forEach(taskCompanies, function(fteCompany)
    {
      const count = fteCompany.count;

      if (Array.isArray(count))
      {
        _.forEach(count, function(divisionCount)
        {
          taskTotals.overall += divisionCount.value;
          taskTotals[divisionCount.division] += divisionCount.value;
          overallTotals.overall += divisionCount.value;
          overallTotals[divisionCount.division] += divisionCount.value;
        });
      }
      else if (typeof count === 'number')
      {
        _.forEach(totalsKeys, function(key)
        {
          taskTotals[key] += count;
          overallTotals[key] += count;
        });
      }
    });
  }

  fteLeaderEntrySchema.methods.applyChangeRequest = function(changes, updater)
  {
    const tasks = this.tasks;
    let divisionModified = false;

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
      functions: _.map(options.functions, function(functionEntry)
      {
        return {
          id: functionEntry.id,
          companies: _.map(functionEntry.companies, function(companyEntry)
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

              count = _.map(options.prodDivisions, function(prodDivision)
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
      .forEach(function(prodFunction)
      {
        _.forEach(prodFunction.companies, companyId => { companies[companyId] = true; });
      });

    return Object.keys(companies);
  }

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
