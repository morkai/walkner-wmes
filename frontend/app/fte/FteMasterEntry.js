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

  return Model.extend({

    urlRoot: '/fte/master',

    clientUrlRoot: '#fte/master',

    topicPrefix: 'fte.master',

    privilegePrefix: 'FTE:MASTER',

    nlsDomain: 'fte',

    defaults: {
      subdivision: null,
      date: null,
      shift: null,
      flows: null,
      tasks: null,
      createdAt: null,
      creator: null,
      updatedAt: null,
      updater: null,
      absentUsers: null
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

    serializeWithTotals: function()
    {
      var totals = {
        demand: 0,
        demandByCompany: {},
        supply: 0,
        supplyByCompany: {},
        supplyByProdFunction: {},
        shortage: 0,
        shortageByCompany: {}
      };
      var supplyColumnCount = 0;
      var task = this.get('tasks')[0];

      if (task)
      {
        _.forEach(task.demand, function(demand)
        {
          totals.demandByCompany[demand.id] = {
            id: demand.id,
            name: demand.name,
            total: 0
          };
        });

        task.functions.forEach(function(taskFunction)
        {
          var prodFunction = prodFunctions.get(taskFunction.id);

          totals.supplyByProdFunction[taskFunction.id] = {
            prodFunction: prodFunction ? prodFunction.getLabel() : taskFunction.id,
            total: 0,
            companies: {}
          };

          taskFunction.companies.forEach(function(taskFunctionCompany)
          {
            totals.supplyByProdFunction[taskFunction.id].companies[taskFunctionCompany.id] = 0;

            totals.supplyByCompany[taskFunctionCompany.id] = {
              name: taskFunctionCompany.name,
              total: 0
            };

            supplyColumnCount += 1;
          });
        });

        _.forEach(task.shortage, function(shortage)
        {
          totals.shortageByCompany[shortage.id] = {
            id: shortage.id,
            name: shortage.name,
            total: 0
          };
        });
      }

      var tasks = this.serializeTasks(totals);

      Object.keys(totals.supplyByCompany).forEach(function(companyId)
      {
        totals.supply += totals.supplyByCompany[companyId].total;
        supplyColumnCount += 1;
      });

      _.forEach(totals.demandByCompany, function(demand)
      {
        totals.demand += demand.total;
      });

      _.forEach(totals.shortageByCompany, function(demand)
      {
        totals.shortage += demand.total;
      });

      var companyCount = Object.keys(totals.supplyByCompany).length;
      var companyTotals = this.get('companyTotals');
      var absenceByCompany = {};

      Object.keys(totals.shortageByCompany).forEach(function(companyId)
      {
        absenceByCompany[companyId] = companyTotals[companyId] ? companyTotals[companyId].absence : 0;
      });

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        companyCount: companyCount,
        demand: {
          available: !_.isEmpty(totals.demandByCompany),
          columnCount: companyCount + 1,
          overallTotal: totals.demand,
          totalByCompany: totals.demandByCompany
        },
        supply: {
          columnCount: supplyColumnCount,
          overallTotal: totals.supply,
          totalByProdFunction: totals.supplyByProdFunction,
          totalByCompany: totals.supplyByCompany
        },
        shortage: {
          available: !_.isEmpty(totals.shortageByCompany),
          columnCount: companyCount + 1,
          overallTotal: totals.shortage,
          totalByCompany: totals.shortageByCompany,
          overallAbsence: companyTotals.total.absence,
          absenceByCompany: absenceByCompany
        },
        tasks: tasks,
        absentUsers: (this.get('absentUsers') || []).filter(function(absentUser) { return !!absentUser; })
      };
    },

    serializeTasks: function(totals)
    {
      var absenceTasks = this.get('absenceTasks') || {};

      return this.get('tasks').map(function(task)
      {
        task.totalDemand = 0;
        task.totalShortage = 0;
        task.totalByCompany = {};

        var shortageByCompany = {};

        _.forEach(task.shortage, function(taskShortage)
        {
          taskShortage.count = 0;

          shortageByCompany[taskShortage.id] = taskShortage;
        });

        _.forEach(task.demand, function(taskDemand)
        {
          var count = taskDemand.count;

          task.totalDemand += count;
          task.totalShortage += count;
          totals.demandByCompany[taskDemand.id].total += count;
          totals.shortageByCompany[taskDemand.id].total += count;
          shortageByCompany[taskDemand.id].count = count;
        });

        var prodFlow = task.type === 'prodFlow';
        var absenceTask = absenceTasks[task.id] >= 0;

        task.functions.forEach(function(prodFunction)
        {
          prodFunction.companies.forEach(function(company)
          {
            var count = company.count;

            task.totalShortage -= count;

            if (prodFlow && totals.shortageByCompany[company.id])
            {
              totals.shortageByCompany[company.id].total -= count;
            }

            if (shortageByCompany[company.id])
            {
              shortageByCompany[company.id].count -= count;
            }

            if (typeof task.totalByCompany[company.id] !== 'number')
            {
              task.totalByCompany[company.id] = 0;
            }

            task.totalByCompany[company.id] += count;

            if (totals.supplyByCompany[company.id])
            {
              totals.supplyByCompany[company.id].total += count;
            }

            if (totals.supplyByProdFunction)
            {
              totals.supplyByProdFunction[prodFunction.id].total += count;
              totals.supplyByProdFunction[prodFunction.id].companies[company.id] += count;
            }
          });
        });

        if (absenceTask && task.shortage)
        {
          task.totalShortage = Math.abs(task.totalShortage);

          task.shortage.forEach(function(taskShortage)
          {
            taskShortage.count = Math.abs(taskShortage.count);
          });
        }

        return task;
      });
    },

    isEditable: function(user)
    {
      return isEditable(this, user);
    },

    handleUpdateMessage: function(message, silent)
    {
      if (message.type === 'count' || message.type === 'plan')
      {
        this.handleCountOrPlanMessage(message, silent);
      }
      else if (message.type === 'addAbsentUser')
      {
        this.handleAddAbsentUserMessage(message, silent);
      }
      else if (message.type === 'removeAbsentUser')
      {
        this.handleRemoveAbsentUserMessage(message, silent);
      }
      else if (message.type === 'edit')
      {
        this.handleEditMessage(message, silent);
      }
    },

    handleCountOrPlanMessage: function(message, silent)
    {
      var tasks = this.get('tasks');

      if (!tasks)
      {
        return;
      }

      var taskIndex = _.findIndex(tasks, function(task) { return task.id === message.task.id; });

      if (taskIndex === -1)
      {
        return;
      }

      tasks[taskIndex] = message.task;

      this.set(message.data, {silent: !!silent});

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    },

    handleAddAbsentUserMessage: function(message, silent)
    {
      var absentUsers = this.get('absentUsers') || [];

      absentUsers.push(message.user);

      if (!silent)
      {
        this.trigger('change:absentUsers');
        this.trigger('change');
      }
    },

    handleRemoveAbsentUserMessage: function(message, silent)
    {
      var absentUsers = this.get('absentUsers') || [];
      var index = -1;

      for (var i = 0, l = absentUsers.length; i < l; ++i)
      {
        if (absentUsers[i].id === message.userId)
        {
          index = i;

          break;
        }
      }

      if (index !== -1)
      {
        absentUsers.splice(index, 1);

        if (!silent)
        {
          this.trigger('change:absentUsers');
          this.trigger('change');
        }
      }
    },

    handleEditMessage: function(message, silent)
    {
      var tasks = this.get('tasks');

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
