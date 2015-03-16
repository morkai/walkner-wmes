// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
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

  var fteLeaderTaskFunctionSchema = mongoose.Schema({
    id: String,
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
    name: String,
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

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.index({date: -1});

  fteLeaderEntrySchema.statics.createForShift = function(options, creator, done)
  {
    var ProdTask = mongoose.model('ProdTask');
    var FteLeaderEntry = mongoose.model('FteLeaderEntry');
    var prodDivisions = app.divisions.models
      .filter(function(division) { return division.type === 'prod'; })
      .map(function(division) { return division._id; })
      .sort();

    step(
      function prepareProdFunctionsStep()
      {
        this.functions = app.prodFunctions.models
          .filter(function(prodFunction)
          {
            return prodFunction.fteLeaderPosition > -1;
          })
          .sort(function(a, b)
          {
            return a.fteLeaderPosition - b.fteLeaderPosition;
          })
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

    fteDiv.forEach(function(divisionId)
    {
      overallTotals[divisionId] = 0;
    });

    var keys = Object.keys(overallTotals);

    this.tasks.forEach(function(task)
    {
      task.totals = {};

      keys.forEach(function(key)
      {
        task.totals[key] = 0;
      });

      if (Array.isArray(task.functions) && task.functions.length)
      {
        task.functions.forEach(function(taskFunction)
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
      taskCompanies.forEach(function(fteCompany)
      {
        var count = fteCompany.count;

        if (Array.isArray(count))
        {
          count.forEach(function(divisionCount)
          {
            taskTotals.overall += divisionCount.value;
            taskTotals[divisionCount.division] += divisionCount.value;
            overallTotals.overall += divisionCount.value;
            overallTotals[divisionCount.division] += divisionCount.value;
          });
        }
        else if (typeof count === 'number')
        {
          keys.forEach(function(key)
          {
            taskTotals[key] += count;
            overallTotals[key] += count;
          });
        }
      });
    }
  };

  fteLeaderEntrySchema.methods.updateComment = function(options, updater, done)
  {
    var task = this.tasks[options.taskIndex];

    if (!task)
    {
      return done(new Error('INPUT'));
    }

    task.comment = typeof options.comment === 'string' ? options.comment.trim() : '';

    this.markModified('tasks');
    this.set({
      updatedAt: new Date(),
      updater: updater
    });
    this.save(done);
  };

  fteLeaderEntrySchema.methods.updateCount = function(options, updater, done)
  {
    var task = this.tasks[options.taskIndex];

    if (!task)
    {
      return done(new Error('INPUT'));
    }

    var company;
    var companyIndex = typeof options.companyIndexServer === 'number'
      ? options.companyIndexServer
      : options.companyIndex;

    if (Array.isArray(task.functions) && task.functions.length)
    {
      var taskFunction = task.functions[options.functionIndex];

      if (!taskFunction)
      {
        return done(new Error('INPUT'));
      }

      company = taskFunction.companies[companyIndex];
    }
    else
    {
      company = task.companies[companyIndex];
    }

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

    if (task.parent)
    {
      this.updateParentCount(task.parent.toString());
    }

    this.markModified('tasks');
    this.calcTotals();
    this.set({
      updatedAt: new Date(),
      updater: updater
    });
    this.save(done);
  };

  fteLeaderEntrySchema.methods.updateParentCount = function(parentId)
  {
    var fteDivCount = Array.isArray(this.fteDiv) ? this.fteDiv.length : 0;
    var prodTaskMaps = mapProdTasks(this.tasks);

    updateParentCount(parentId);

    function updateParentCount(parentId)
    {
      var parentTask = prodTaskMaps.idToTask[parentId];

      if (!parentTask)
      {
        return;
      }

      var childTasks = prodTaskMaps.idToChildren[parentId];
      var parentTaskFunctions = parentTask.functions;

      _.forEach(childTasks, function(childTask, taskIndex)
      {
        var firstTask = taskIndex === 0;

        _.forEach(childTask.functions, function(taskFunction, functionIndex)
        {
          _.forEach(taskFunction.companies, function(taskCompany, companyIndex)
          {
            var parentCompany = parentTaskFunctions[functionIndex].companies[companyIndex];
            var count = taskCompany.count;

            if (Array.isArray(count))
            {
              _.forEach(count, function(divisionCount, divisionIndex)
              {
                if (firstTask)
                {
                  parentCompany.count[divisionIndex].value = divisionCount.value;
                }
                else
                {
                  parentCompany.count[divisionIndex].value += divisionCount.value;
                }
              });
            }
            else if (typeof parentCompany.count === 'number')
            {
              if (firstTask)
              {
                parentCompany.count = count;
              }
              else
              {
                parentCompany.count += count;
              }
            }
            else if (fteDivCount > 0)
            {
              count = Math.round(count / fteDivCount * 1000) / 1000;

              _.forEach(parentCompany.count, function(divisionCount)
              {
                if (firstTask)
                {
                  divisionCount.value = count;
                }
                else
                {
                  divisionCount.value += count;
                }
              });
            }
          });
        });
      });

      if (parentTask.parent)
      {
        updateParentCount(parentTask.parent);
      }
    }
  };

  function getProdFunctionCompanyEntries(prodFunction)
  {
    var companies = [];

    prodFunction.companies.forEach(function(companyId)
    {
      var company = app.companies.modelsById[companyId];

      if (company && company.fteLeaderPosition > -1)
      {
        companies.push(company);
      }
    });

    return companies
      .sort(function(a, b)
      {
        return a.fteLeaderPosition - b.fteLeaderPosition;
      })
      .map(function(company)
      {
        return {
          id: company._id,
          name: company.name,
          count: 0
        };
      });
  }

  function mapProdTasks(prodTaskList)
  {
    var idToTask = {};
    var idToChildren = {};

    _.forEach(prodTaskList, function(task)
    {
      idToTask[task._id || task.id] = task;

      if (!task.parent)
      {
        return;
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
    });

    return {
      idToTask: idToTask,
      idToChildren: idToChildren
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

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
