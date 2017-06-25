// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../data/subdivisions',
  '../data/prodFunctions',
  '../orgUnits/util/renderOrgUnitPath',
  '../core/Model',
  './util/isEditable'
], function(
  _,
  t,
  time,
  subdivisions,
  prodFunctions,
  renderOrgUnitPath,
  Model,
  isEditable
) {
  'use strict';

  var ROW_COLORS = [
    [242, 222, 222],
    [217, 237, 247],
    [223, 240, 216],
    [252, 248, 227],
    [238, 238, 238],
    [254, 229, 254]
  ];

  function darken(color, intensity)
  {
    var percent = 1 - intensity;

    return [
      Math.round(color[0] * percent),
      Math.round(color[1] * percent),
      Math.round(color[2] * percent)
    ];
  }

  function rgb(color)
  {
    return 'rgb(' + color + ')';
  }

  return Model.extend({

    urlRoot: '/fte/leader',

    clientUrlRoot: '#fte/leader',

    topicPrefix: 'fte.leader',

    privilegePrefix: 'FTE:LEADER',

    nlsDomain: 'fte',

    defaults: {
      subdivision: null,
      date: null,
      shift: null,
      fteDiv: null,
      tasks: null,
      createdAt: null,
      creator: null,
      updatedAt: null,
      updater: null
    },

    getLabel: function()
    {
      return t(this.nlsDomain, 'label', {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift'))
      });
    },

    getSubdivisionPath: function()
    {
      var subdivision = subdivisions.get(this.get('subdivision'));

      return subdivision ? renderOrgUnitPath(subdivision, false, false) : '?';
    },

    isWithFunctions: function()
    {
      var tasks = this.get('tasks');

      if (!tasks || !tasks.length)
      {
        return false;
      }

      var firstTask = tasks[0];

      return Array.isArray(firstTask.functions) && firstTask.functions.length > 0;
    },

    isWithDivisions: function()
    {
      var fteDiv = this.get('fteDiv');

      return Array.isArray(fteDiv) && fteDiv.length > 0;
    },

    serializeWithTotals: function()
    {
      return this.isWithFunctions() ? this.serializeWithFunctions() : this.serializeWithoutFunctions();
    },

    serializeWithFunctions: function()
    {
      var totalByCompany = {};
      var totalByProdFunction = {};

      this.prepareTotalsWithFunctions(totalByCompany, totalByProdFunction);

      var tasks = this.serializeTasksWithFunctions(totalByCompany, totalByProdFunction);
      var total = 0;

      _.forEach(totalByCompany, function(totalByCompanyItem)
      {
        total += totalByCompanyItem.total;
      });

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        divisions: this.get('fteDiv') || [],
        companyCount: Object.keys(totalByCompany).length,
        total: total,
        totalByCompany: totalByCompany,
        totalByProdFunction: totalByProdFunction,
        tasks: tasks
      };
    },

    prepareTotalsWithFunctions: function(totalByCompany, totalByProdFunction)
    {
      var tasks = this.get('tasks');

      if (!this.get('tasks').length)
      {
        return;
      }

      var companyToIndex = {};
      var fteDiv = this.get('fteDiv') || [];

      _.forEach(tasks[0].functions, function(taskFunction)
      {
        _.forEach(taskFunction.companies, function(taskFunctionCompany)
        {
          if (companyToIndex[taskFunctionCompany.id] === undefined)
          {
            companyToIndex[taskFunctionCompany.id] = Object.keys(companyToIndex).length;
          }
        });
      });

      _.forEach(tasks[0].functions, function(taskFunction)
      {
        var prodFunction = prodFunctions.get(taskFunction.id);

        totalByProdFunction[taskFunction.id] = {
          prodFunction: prodFunction ? prodFunction.getLabel() : taskFunction.id,
          total: 0,
          companies: {}
        };

        _.forEach(taskFunction.companies, function(taskFunctionCompany)
        {
          var companyIndex = companyToIndex[taskFunctionCompany.id];

          totalByProdFunction[taskFunction.id].companies[taskFunctionCompany.id] = {
            index: companyIndex,
            total: 0,
            divisions: {}
          };

          totalByCompany[taskFunctionCompany.id] = {
            index: companyIndex,
            name: taskFunctionCompany.name,
            total: 0,
            divisions: {}
          };

          _.forEach(fteDiv, function(divisionId)
          {
            totalByProdFunction[taskFunction.id].companies[taskFunctionCompany.id].divisions[divisionId] = 0;
            totalByCompany[taskFunctionCompany.id].divisions[divisionId] = 0;
          });
        });
      });
    },

    serializeTasksWithFunctions: function(totalByCompany, totalByProdFunction)
    {
      var companies = Object.keys(totalByCompany);
      var fteDiv = this.get('fteDiv') || [];
      var topLevelTasks = [];
      var idToTask = {};
      var idToChildren = {};

      _.forEach(this.get('tasks'), function(task, taskIndex)
      {
        task.index = taskIndex;
        task.fteDiv = false;
        task.totalByCompany = {};
        task.backgroundColor = null;
        task.level = 0;
        task.last = false;

        var notParent = task.childCount === 0;

        _.forEach(task.functions, function(prodFunction)
        {
          _.forEach(prodFunction.companies, function(company)
          {
            company.index = companies.indexOf(company.id);

            if (task.totalByCompany[company.id] === undefined)
            {
              task.totalByCompany[company.id] = {
                index: company.index,
                total: 0,
                divisions: {}
              };
            }

            var totalCount = 0;
            var companyDivisionTotals = task.totalByCompany[company.id].divisions;

            if (Array.isArray(company.count))
            {
              task.fteDiv = true;

              _.forEach(company.count, function(count)
              {
                totalCount += count.value;

                if (companyDivisionTotals[count.division] === undefined)
                {
                  companyDivisionTotals[count.division] = 0;
                }

                companyDivisionTotals[count.division] += count.value;

                if (notParent)
                {
                  totalByCompany[company.id].divisions[count.division] += count.value;
                  totalByProdFunction[prodFunction.id].companies[company.id].divisions[count.division] += count.value;
                }
              });
            }
            else
            {
              totalCount = company.count;

              var divisionCount = company.count / fteDiv.length;

              _.forEach(fteDiv, function(divisionId)
              {
                if (companyDivisionTotals[divisionId] === undefined)
                {
                  companyDivisionTotals[divisionId] = 0;
                }

                companyDivisionTotals[divisionId] += divisionCount;

                if (notParent)
                {
                  totalByCompany[company.id].divisions[divisionId] += divisionCount;
                  totalByProdFunction[prodFunction.id].companies[company.id].divisions[divisionId] += divisionCount;
                }
              });
            }

            task.totalByCompany[company.id].total += totalCount;

            if (notParent)
            {
              totalByCompany[company.id].total += totalCount;

              totalByProdFunction[prodFunction.id].total += totalCount;
              totalByProdFunction[prodFunction.id].companies[company.id].total += totalCount;
            }
          });
        });

        idToTask[task.id] = task;

        if (!task.parent)
        {
          topLevelTasks.push(task);

          return;
        }

        if (idToChildren[task.parent])
        {
          idToChildren[task.parent].push(task);
        }
        else
        {
          idToChildren[task.parent] = [task];
        }
      });

      var tasks = [];
      var rowColorIndex = -1;

      topLevelTasks.forEach(function(task) { pushTask(task, 0); });

      if (tasks.length)
      {
        tasks[tasks.length - 1].last = true;
      }

      return tasks;

      function pushTask(task, level)
      {
        tasks.push(task);

        task.level = level;
        task.children = idToChildren[task.id] || [];
        task.hasChildren = task.children.length > 0;

        if (level === 0)
        {
          ++rowColorIndex;
        }

        if (rowColorIndex === ROW_COLORS.length)
        {
          rowColorIndex = 0;
        }

        task.backgroundColor = rgb(darken(ROW_COLORS[rowColorIndex], level * 0.1));

        if (task.hasChildren)
        {
          task.children[task.children.length - 1].lastChild = true;
          task.children.forEach(function(childTask) { pushTask(childTask, level + 1); });
        }
      }
    },

    serializeWithoutFunctions: function()
    {
      var companies = this.serializeCompanies();

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        total: companies.reduce(function(total, company) { return total + company.total; }, 0),
        totalByCompany: null,
        totalByProdFunction: null,
        companies: companies,
        divisions: this.get('fteDiv') || [],
        tasks: this.serializeTasksWithoutFunctions()
      };
    },

    serializeCompanies: function()
    {
      var tasks = this.get('tasks');

      if (!tasks || !tasks.length)
      {
        return [];
      }

      return _.map(tasks[0].companies, function(company, companyIndex)
      {
        company.total = tasks.reduce(function(total, task)
        {
          if (Array.isArray(task.companies[companyIndex].count))
          {
            task.companies[companyIndex].count.forEach(function(divisionCount)
            {
              total += divisionCount.value;
            });
          }
          else
          {
            total += task.companies[companyIndex].count;
          }

          return total;
        }, 0);

        return company;
      });
    },

    serializeTasksWithoutFunctions: function()
    {
      return _.map(this.get('tasks'), function(task)
      {
        task.total = task.companies.reduce(function(total, company)
        {
          if (Array.isArray(company.count))
          {
            company.count.forEach(function(divisionCount) { total += divisionCount.value; });
          }
          else
          {
            total += company.count;
          }

          return total;
        }, 0);

        return task;
      });
    },

    isEditable: function(user)
    {
      return isEditable(this, user);
    },

    handleUpdateMessage: function(message, silent)
    {
      if (message.type === 'edit')
      {
        _.forEach(message.changes, this.handleCountMessage.bind(this));
      }
      else
      {
        this.handleCountMessage(message);
      }

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    },

    handleCountMessage: function(message)
    {
      var tasks = this.get('tasks');

      if (!tasks)
      {
        return;
      }

      var task = tasks[message.taskIndex];

      if (!task)
      {
        return;
      }

      if (message.comment === undefined)
      {
        var company;

        if (this.isWithFunctions())
        {
          var taskFunction = task.functions[message.functionIndex];

          if (!taskFunction)
          {
            return;
          }

          company = taskFunction.companies[message.companyIndex];
        }
        else
        {
          company = task.companies[message.companyIndex];
        }

        if (!company)
        {
          return;
        }

        if (typeof message.divisionIndex === 'number')
        {
          var division = company.count[message.divisionIndex];

          if (!division)
          {
            return;
          }

          division.value = message.newCount;
        }
        else
        {
          company.count = message.newCount;
        }
      }
      else
      {
        task.comment = message.comment;
      }
    }

  });
});
