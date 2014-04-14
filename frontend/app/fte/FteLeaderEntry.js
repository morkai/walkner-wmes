define([
  '../i18n',
  '../time',
  '../data/subdivisions',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  t,
  time,
  subdivisions,
  renderOrgUnitPath,
  Model
) {
  'use strict';

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

    serializeWithTotals: function()
    {
      var companies = this.serializeCompanies();

      return {
        subdivision: this.getSubdivisionPath(),
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        total: companies.reduce(function(total, company) { return total + company.total; }, 0),
        companies: companies,
        divisions: this.get('fteDiv') || [],
        tasks: this.serializeTasks()
      };
    },

    serializeCompanies: function()
    {
      var tasks = this.get('tasks');

      if (!tasks.length)
      {
        return [];
      }

      return tasks[0].companies.map(function(company, companyIndex)
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

    serializeTasks: function()
    {
      return this.get('tasks').map(function(task)
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
      if (user.isAllowedTo('PROD_DATA:MANAGE'))
      {
        return true;
      }

      if (!user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return false;
      }

      var creator = this.get('creator');

      if (creator && user.data._id !== creator.id)
      {
        return false;
      }

      var userDivision = user.getDivision();

      if (!user.isAllowedTo(this.privilegePrefix + ':ALL') && userDivision)
      {
        var subdivision = subdivisions.get(this.get('subdivision'));

        if (!subdivision || subdivision.get('division') !== userDivision.id)
        {
          return false;
        }
      }

      var createdAt = Date.parse(this.get('createdAt'));

      return Date.now() < createdAt + 8 * 3600 * 1000;
    },

    handleUpdateMessage: function(message, silent)
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

      var company = task.companies[message.companyIndex];

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

      if (!silent)
      {
        this.trigger('change:tasks');
        this.trigger('change');
      }
    }

  });

});
