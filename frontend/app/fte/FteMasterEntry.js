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

    TYPE: 'master',

    urlRoot: '/fte/master',

    clientUrlRoot: '#fte/master',

    topicPrefix: 'fte.master',

    privilegePrefix: 'FTE:MASTER',

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

    serializeWithTotals: function()
    {
      var companies = {};
      var totalSupply = {
        total: 0,
        byCompany: {},
        byProdFunction: {}
      };
      var supplyColumnCount = 0;
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
            totalSupply.byProdFunction[taskFunction.id].companies[taskCompany.id] = 0;

            totalSupply.byCompany[taskCompany.id] = {
              name: taskCompany.name,
              total: 0
            };

            companies[taskCompany.id] = taskCompany.name;

            supplyColumnCount += 1;
          });
        });
      }

      var tasks = this.serializeTasks(totalSupply);
      var companyCount = Object.keys(companies).length;
      var totals = this.get('totals');

      supplyColumnCount += companyCount;

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        companyCount: companyCount,
        companies: companies,
        demand: {
          columnCount: companyCount + 1,
          overallTotal: totals.demand.total,
          totalByCompany: totals.demand
        },
        supply: {
          columnCount: supplyColumnCount,
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
        tasks: tasks,
        absentUsers: (this.get('absentUsers') || []).filter(function(absentUser) { return !!absentUser; })
      };
    },

    serializeTasks: function(totalSupply)
    {
      var absenceTasks = this.get('absenceTasks');

      return this.get('tasks').map(function(task)
      {
        task.absence = absenceTasks[task.id] >= 0;
        task.totalByCompany = {};

        task.functions.forEach(function(taskFunction)
        {
          taskFunction.companies.forEach(function(taskCompany)
          {
            var companyId = taskCompany.id;
            var count = taskCompany.count;

            if (!task.totalByCompany[companyId])
            {
              task.totalByCompany[companyId] = 0;
            }

            task.totalByCompany[companyId] += count;

            if (!task.absence)
            {
              totalSupply.total += count;
              totalSupply.byCompany[companyId].total += count;
              totalSupply.byProdFunction[taskFunction.id].total += count;
              totalSupply.byProdFunction[taskFunction.id].companies[companyId] += count;
            }
          });
        });

        return task;
      }).sort(function(a, b)
      {
        if (a.type === b.type)
        {
          return a.name.localeCompare(b.name, undefined, {numeric: true, ignorePunctuation: true});
        }

        return a.type === 'prodFlow' ? -1 : 1;
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

      if (message.task)
      {
        var taskIndex = _.findIndex(tasks, function(task) { return task.id === message.task.id; });

        if (taskIndex === -1)
        {
          return;
        }

        tasks[taskIndex] = message.task;
      }

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
