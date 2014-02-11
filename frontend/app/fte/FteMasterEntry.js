define([
  'moment',
  '../data/subdivisions',
  '../data/prodFunctions',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  moment,
  subdivisions,
  prodFunctions,
  renderOrgUnitPath,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/fte/master',

    clientUrlRoot: '#fte/master',

    topicPrefix: 'fte.master',

    privilegePrefix: 'FTE:LEADER',

    nlsDomain: 'fte',

    defaults: {
      subdivision: null,
      date: null,
      shift: null,
      flows: null,
      tasks: null,
      locked: false,
      createdAt: null,
      creatorId: null,
      creatorLabel: null,
      updatedAt: null,
      updaterId: null,
      updaterLabel: null,
      absentUsers: null
    },

    serializeWithTotals: function()
    {
      var subdivision = subdivisions.get(this.get('subdivision'));

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
        subdivision: subdivision ? renderOrgUnitPath(subdivision, false, false) : '?',
        date: moment(this.get('date')).format('LL'),
        shift: this.get('shift'),
        companyCount: Object.keys(totalByCompany).length,
        totalByCompany: totalByCompany,
        totalByProdFunction: totalByProdFunction,
        total: total,
        tasks: tasks,
        locked: !!this.get('locked'),
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
    }

  });

});
