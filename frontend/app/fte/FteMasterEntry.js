// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../time',
  '../data/subdivisions',
  '../data/prodFunctions',
  '../data/views/renderOrgUnitPath',
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
      var totalByCompany = {};
      var totalByProdFunction = {};

      if (this.get('tasks').length)
      {
        this.get('tasks')[0].functions.forEach(function(taskFunction)
        {
          var prodFunction = prodFunctions.get(taskFunction.id);

          totalByProdFunction[taskFunction.id] = {
            prodFunction: prodFunction ? prodFunction.getLabel() : taskFunction.id,
            total: 0,
            companies: {}
          };

          taskFunction.companies.forEach(function(taskFunctionCompany)
          {
            totalByProdFunction[taskFunction.id].companies[taskFunctionCompany.id] = 0;

            totalByCompany[taskFunctionCompany.id] = {
              name: taskFunctionCompany.name,
              total: 0
            };
          });
        });
      }

      var tasks = this.serializeTasks(totalByCompany, totalByProdFunction);
      var total = 0;

      Object.keys(totalByCompany).forEach(function(companyId)
      {
        total += totalByCompany[companyId].total;
      });

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        companyCount: Object.keys(totalByCompany).length,
        totalByCompany: totalByCompany,
        totalByProdFunction: totalByProdFunction,
        total: total,
        tasks: tasks,
        absentUsers: (this.get('absentUsers') || []).filter(function(absentUser)
        {
          return !!absentUser;
        })
      };
    },

    serializeTasks: function(totalByCompany, totalByProdFunction)
    {
      return this.get('tasks').map(function(task)
      {
        task.totalByCompany = {};

        task.functions.forEach(function(prodFunction)
        {
          prodFunction.companies.forEach(function(company)
          {
            if (typeof task.totalByCompany[company.id] !== 'number')
            {
              task.totalByCompany[company.id] = 0;
            }

            task.totalByCompany[company.id] += company.count;

            if (totalByCompany)
            {
              totalByCompany[company.id].total += company.count;
            }

            if (totalByProdFunction)
            {
              totalByProdFunction[prodFunction.id].total += company.count;
              totalByProdFunction[prodFunction.id].companies[company.id] += company.count;
            }
          });
        });

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
      else if (message.type === 'plan')
      {
        this.handlePlanMessage(message, silent);
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

      var prodFunction = task.functions[message.functionIndex];

      if (!prodFunction)
      {
        return;
      }

      var company = prodFunction.companies[message.companyIndex];

      if (!company)
      {
        return;
      }

      company.count = message.newCount;

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    },

    handlePlanMessage: function(message, silent)
    {
      var task = _.find(this.get('tasks'), function(task)
      {
        return task.id === message.taskId;
      });

      if (!task)
      {
        return;
      }

      task.noPlan = message.newValue;

      if (task.noPlan)
      {
        task.functions.forEach(function(prodFunction)
        {
          prodFunction.companies.forEach(function(company)
          {
            company.count = 0;
          });
        });
      }

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
      var fteEntry = this;

      _.forEach(message.changes, function(change)
      {
        fteEntry.handleCountMessage(change, true);
      });

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    }

  });

});
