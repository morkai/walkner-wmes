define([
  'moment',
  '../data/companies',
  '../data/aors',
  '../data/prodTasks',
  '../core/Model'
], function(
  moment,
  companies,
  aors,
  prodTasks,
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
      aor: null,
      date: null,
      shift: null,
      tasks: null
    },

    serializeWithTotals: function()
    {
      var companies = this.serializeCompanies();

      return {
        aor: aors.get(this.get('aor')).toJSON(),
        shift: this.get('shift'),
        date: moment(this.get('date')).format('LL'),
        total: companies.reduce(function(total, company) { return total + company.total; }, 0),
        companies: companies,
        tasks: this.serializeTasks()
      };
    },

    serializeCompanies: function()
    {
      var tasks = this.get('tasks');

      return tasks[0].companies.map(function(companyEntry, companyIndex)
      {
        var companyModel = companies.get(companyEntry.company);
        var company = companyModel ? companyModel.toJSON() : {_id: companyEntry, name: '???'};

        company.total = tasks.reduce(function(total, task)
        {
          return total + task.companies[companyIndex].count;
        }, 0);

        return company;
      });
    },

    serializeTasks: function()
    {
      return this.get('tasks').map(function(taskEntry)
      {
        var task = prodTasks.get(taskEntry.task);

        if (task)
        {
          task = task.toJSON();
        }
        else
        {
          task = {_id: taskEntry.task, name: '???'};
        }

        task.companies = taskEntry.companies;
        task.total = task.companies.reduce(function(total, company)
        {
          return total + company.count;
        }, 0);

        return task;
      });
    }

  });

});
