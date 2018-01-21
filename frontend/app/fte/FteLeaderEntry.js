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

    TYPE: 'leader',

    urlRoot: '/fte/leader',

    clientUrlRoot: '#fte/leader',

    topicPrefix: 'fte.leader',

    privilegePrefix: 'FTE:LEADER',

    nlsDomain: 'fte',

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
      var companies = {};
      var totalSupply = {
        total: 0,
        byCompany: {},
        byProdFunction: {}
      };
      var supplyColumnCount = 0;
      var divisions = this.get('fteDiv') || [];
      var task = this.get('tasks')[0];

      if (task)
      {
        task.functions.forEach(function(taskFunction)
        {
          var prodFunction = prodFunctions.get(taskFunction.id);

          totalSupply.byProdFunction[taskFunction.id] = {
            name: prodFunction ? prodFunction.getLabel() : taskFunction.id,
            total: 0,
            companies: {}
          };

          taskFunction.companies.forEach(function(taskCompany)
          {
            if (!companies[taskCompany.id])
            {
              companies[taskCompany.id] = {
                index: Object.keys(companies).length,
                name: taskCompany.name
              };
            }

            totalSupply.byProdFunction[taskFunction.id].companies[taskCompany.id] = {
              total: 0,
              divisions: {}
            };

            totalSupply.byCompany[taskCompany.id] = {
              total: 0,
              divisions: {}
            };

            if (!divisions.length)
            {
              supplyColumnCount += 1;
            }

            divisions.forEach(function(divisionId)
            {
              totalSupply.byProdFunction[taskFunction.id].companies[taskCompany.id].divisions[divisionId] = 0;
              totalSupply.byCompany[taskCompany.id].divisions[divisionId] = 0;

              supplyColumnCount += 1;
            });
          });
        });
      }

      var companyCount = Object.keys(companies).length;
      var tasks = this.serializeTasksWithFunctions(totalSupply, companies);
      var totals = this.get('totals');

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        divisions: divisions,
        companyCount: companyCount,
        companies: companies,
        demand: {
          columnCount: companyCount + 1,
          overallTotal: totals.demand.total,
          totalByCompany: totals.demand
        },
        supply: {
          columnCount: supplyColumnCount + companyCount * (divisions.length || 1),
          overallTotal: totalSupply.total,
          totalByProdFunction: totalSupply.byProdFunction,
          totalByCompany: totalSupply.byCompany
        },
        shortage: {
          columnCount: companyCount + 1,
          overallTotal: totals.shortage.total,
          totalByCompany: totals.shortage
        },
        absence: {
          available: !_.isEmpty(this.get('absenceTasks')),
          overallTotal: totals.absence.total,
          totalByCompany: totals.absence
        },
        tasks: tasks
      };
    },

    serializeTasksWithFunctions: function(totalSupply, companies)
    {
      var fteDiv = this.get('fteDiv') || [];
      var absenceTasks = this.get('absenceTasks');
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
        task.absence = absenceTasks[task.id] >= 0;

        var isChildTask = task.childCount === 0;

        _.forEach(task.functions, function(prodFunction)
        {
          _.forEach(prodFunction.companies, function(company)
          {
            company.index = companies[company.id].index;

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

                if (isChildTask && !task.absence)
                {
                  totalSupply.byCompany[company.id].divisions[count.division] += count.value;
                  totalSupply.byProdFunction[prodFunction.id].companies[company.id].divisions[count.division] += count.value;
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

                if (isChildTask && !task.absence)
                {
                  totalSupply.byCompany[company.id].divisions[divisionId] += divisionCount;
                  totalSupply.byProdFunction[prodFunction.id].companies[company.id].divisions[divisionId] += divisionCount;
                }
              });
            }

            task.totalByCompany[company.id].total += totalCount;

            if (isChildTask && !task.absence)
            {
              totalSupply.total += totalCount;
              totalSupply.byCompany[company.id].total += totalCount;
              totalSupply.byProdFunction[prodFunction.id].total += totalCount;
              totalSupply.byProdFunction[prodFunction.id].companies[company.id].total += totalCount;
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
      if (message.type === 'count')
      {
        this.handleCountMessage(message, silent);
      }
      else if (message.type === 'comment')
      {
        this.handleCommentMessage(message, silent);
      }
      else if (message.type === 'edit')
      {
        this.handleEditMessage(message, silent);
      }
    },

    handleCountMessage: function(message, silent)
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

      message.tasks.forEach(function(task, index)
      {
        tasks[index] = task;
      });

      this.set(message.data, {silent: !!silent});

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    },

    handleCommentMessage: function(message, silent)
    {
      var tasks = this.get('tasks');

      if (!tasks)
      {
        return;
      }

      var task = tasks[message.taskIndex];

      if (!task || message.comment === undefined)
      {
        return;
      }

      task.comment = message.comment;

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    },

    handleEditMessage: function(message, silent)
    {
      var tasks = this.get('tasks');

      if (!tasks)
      {
        return;
      }

      message.tasks.forEach(function(task)
      {
        tasks[task.index] = task.data;
      });

      this.set(message.data, {silent: silent});

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    }

  });
});
