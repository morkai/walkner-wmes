// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setupFteLeaderEntryModel(app, mongoose)
{
  var fteLeaderTaskCompanySchema = mongoose.Schema({
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

  var fteLeaderTaskFunctionSchema = mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    companies: [fteLeaderTaskCompanySchema]
  }, {
    _id: false
  });

  var fteLeaderTaskSchema = mongoose.Schema({
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

  fteLeaderEntrySchema.index({subdivision: 1});
  fteLeaderEntrySchema.index({date: -1, subdivision: 1});

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.statics.mapProdTasks = mapProdTasks;

  /**
   * @param {object} options
   * @param {ObjectId} options.subdivision
   * @param {string} options.subdivisionType
   * @param {Date} options.date
   * @param {number} options.shift
   * @param {boolean} options.copy
   * @param {Array.<{id: string, companies: Array.<string>}>} options.structure
   * @param {object} creator
   * @param {function(Error, FteLeaderEntry)} done
   */
  fteLeaderEntrySchema.statics.createForShift = function(options, creator, done)
  {
    var ProdTask = mongoose.model('ProdTask');
    var FteLeaderEntry = mongoose.model('FteLeaderEntry');
    var prodDivisions = app.divisions.models
      .filter(function(division) { return division.type === 'prod'; })
      .map(function(division) { return division._id; })
      .sort();
    var sortedCompanies = prepareSortedCompanies(options.structure);

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
          var conditions = {
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

        var ctx = this;
        var functions = this.functions;

        var prodTaskMaps = mapProdTasks(prodTasks);
        var prevEntryValues = mapPrevEntryValues(prevFteEntry);

        this.tasks = _.map(prodTasks, function(prodTask)
        {
          ctx.fteDiv = ctx.fteDiv || prodTask.fteDiv;

          return {
            id: prodTask._id,
            parent: prodTask.parent || null,
            childCount: 0,
            name: prodTask.name,
            companies: [],
            functions: _.map(functions, function(functionEntry)
            {
              return {
                id: functionEntry.id,
                companies: _.map(functionEntry.companies, function(companyEntry)
                {
                  var key = prodTask._id + ':' + functionEntry.id + ':' + companyEntry.id;
                  var count;

                  if (!prodTask.fteDiv && !isAnyChildFteDivided(prodTask, prodTaskMaps))
                  {
                    count = prevEntryValues[key] || 0;
                  }
                  else
                  {
                    var prevCountPerDivision = (prevEntryValues[key] || 0) / prodDivisions.length;

                    count = _.map(prodDivisions, function(prodDivision)
                    {
                      var value = prevEntryValues[key + ':' + prodDivision];

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
        }).sort(function(a, b)
        {
          return a.name.localeCompare(b.name);
        });

        var idToTask = {};
        var idToChildCount = {};

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
        var fteLeaderEntry = new FteLeaderEntry({
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

        if (options.copy)
        {
          fteLeaderEntry.calcTotals();
        }

        fteLeaderEntry.save(done);
      }
    );
  };

  fteLeaderEntrySchema.methods.calcTotals = function()
  {
    var overallTotals = {
      overall: 0
    };
    var fteDiv = this.fteDiv || [];

    _.forEach(fteDiv, function(divisionId)
    {
      overallTotals[divisionId] = 0;
    });

    var keys = Object.keys(overallTotals);

    _.forEach(this.tasks, function(task)
    {
      task.totals = {};

      _.forEach(keys, function(key)
      {
        task.totals[key] = 0;
      });

      if (Array.isArray(task.functions) && task.functions.length)
      {
        _.forEach(task.functions, function(taskFunction)
        {
          calcCompaniesTotals(taskFunction.companies, task.totals, overallTotals);
        });
      }
      else
      {
        calcCompaniesTotals(task.companies, task.totals, overallTotals);
      }
    });

    this.totals = overallTotals;

    function calcCompaniesTotals(taskCompanies, taskTotals, overallTotals)
    {
      _.forEach(taskCompanies, function(fteCompany)
      {
        var count = fteCompany.count;

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
          _.forEach(keys, function(key)
          {
            taskTotals[key] += count;
            overallTotals[key] += count;
          });
        }
      });
    }
  };

  function getProdFunctionCompanyEntries(prodFunctionCompanies, sortedCompanies)
  {
    var companies = [];

    _.forEach(sortedCompanies, function(companyId)
    {
      if (!_.includes(prodFunctionCompanies, companyId))
      {
        return;
      }

      var company = app.companies.modelsById[companyId];

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
    var idToTask = {};
    var idToChildren = {};
    var idToIndex = {};

    for (var i = 0; i < tasks.length; ++i)
    {
      var task = tasks[i];

      idToTask[task.id] = task;
      idToIndex[task.id] = i;

      if (!task.parent)
      {
        continue;
      }

      var parentId = task.parent.toString();

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
    var prevEntryValues = {};

    if (!prevFteEntry)
    {
      return prevEntryValues;
    }

    _.forEach(prevFteEntry.tasks, function(task)
    {
      _.forEach(task.functions, function(taskFunction)
      {
        _.forEach(taskFunction.companies, function(taskCompany)
        {
          var count = taskCompany.count;
          var key = task.id + ':' + taskFunction.id + ':' + taskCompany.id;

          if (Array.isArray(count))
          {
            prevEntryValues[key] = 0;

            _.forEach(count, function(divisionCount)
            {
              prevEntryValues[key] += divisionCount.value;
              prevEntryValues[key + ':' + divisionCount.division] = divisionCount.value;
            });
          }
          else
          {
            prevEntryValues[key] = count;
          }
        });
      });
    });

    return prevEntryValues;
  }

  function isAnyChildFteDivided(prodTask, prodTaskMaps)
  {
    var childProdTasks = prodTaskMaps.idToChildren[prodTask._id];

    if (!childProdTasks || !childProdTasks.length)
    {
      return false;
    }

    for (var i = 0; i < childProdTasks.length; ++i)
    {
      var childProdTask = childProdTasks[i];

      if (childProdTask.fteDiv || isAnyChildFteDivided(childProdTask, prodTaskMaps))
      {
        return true;
      }
    }

    return false;
  }

  function prepareSortedCompanies(structure)
  {
    var companies = {};

    [].concat(structure)
      .sort(function(a, b) { return b.companies.length - a.companies.length; })
      .forEach(function(prodFunction)
      {
        _.forEach(prodFunction.companies, function(companyId)
        {
          companies[companyId] = true;
        });
      });

    return Object.keys(companies);
  }

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
