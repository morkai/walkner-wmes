define([
  'moment',
  '../data/subdivisions',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  moment,
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
      tasks: null,
      locked: false,
      createdAt: null,
      creatorId: null,
      creatorLabel: null,
      updatedAt: null,
      updaterId: null,
      updaterLabel: null
    },

    serializeWithTotals: function()
    {
      var companies = this.serializeCompanies();
      var subdivision = subdivisions.get(this.get('subdivision'));

      return {
        subdivision: subdivision ? renderOrgUnitPath(subdivision, false, false) : '?',
        date: moment(this.get('date')).format('LL'),
        shift: this.get('shift'),
        total: companies.reduce(function(total, company) { return total + company.total; }, 0),
        companies: companies,
        tasks: this.serializeTasks(),
        locked: !!this.get('locked')
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
          return total + task.companies[companyIndex].count;
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
          return total + company.count;
        }, 0);

        return task;
      });
    }

  });

});
