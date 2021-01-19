// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-employments/templates/form'
], function(
  time,
  viewport,
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-month': 'loadExisting'

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      const workplaces = new Map();
      const departments = new Set();

      (this.model.get('departments') || []).forEach(d =>
      {
        if (!workplaces.has(d.workplace))
        {
          workplaces.set(d.workplace, {
            _id: d.workplace,
            label: dictionaries.getLabel('workplaces', d.workplace),
            division: dictionaries.workplaces.get(d.workplace).get('division'),
            departments: []
          });
        }

        workplaces.get(d.workplace).departments.push({
          _id: d.department,
          label: dictionaries.getLabel('departments', d.department),
          count: d.count
        });

        departments.add(d.department);
      });

      dictionaries.departments.forEach(department =>
      {
        if (departments.has(department.id))
        {
          return;
        }

        const workplaceId = department.get('workplace');

        if (!workplaces.has(workplaceId))
        {
          workplaces.set(workplaceId, {
            _id: workplaceId,
            label: dictionaries.getLabel('workplaces', workplaceId),
            division: dictionaries.workplaces.get(workplaceId).get('division'),
            departments: []
          });
        }

        workplaces.get(workplaceId).departments.push({
          _id: department.id,
          label: department.getLabel(),
          count: 0
        });
      });

      this.departments = {};

      workplaces.forEach(workplace =>
      {
        workplace.departments.sort((a, b) => a.label.localeCompare(
          b.label, undefined, {numeric: true, ignorePunctuation: true}
        ));

        workplace.departments.forEach(department =>
        {
          this.departments[`d${department._id}`] = {
            division: workplace.division,
            workplace: workplace._id,
            department: department._id,
            count: department.count
          };
        });
      });

      return {
        workplaces: Array.from(workplaces.values()).sort((a, b) => a.label.localeCompare(
          b.label, undefined, {numeric: true, ignorePunctuation: true}
        ))
      };
    },

    serializeToForm: function()
    {
      return {
        month: this.options.editMode ? time.utc.format(this.id, 'YYYY-MM') : (this.month || ''),
        departments: this.departments
      };
    },

    checkValidity: () => true,

    serializeForm: function(formData)
    {
      if (!this.options.editMode)
      {
        formData._id = formData.month + '-01T00:00:00Z';
      }

      delete formData.month;

      formData.departments = Object.values(formData.departments || {});

      formData.departments.forEach(d =>
      {
        d.division = +d.division;
        d.workplace = +d.workplace;
        d.department = +d.department;
        d.count = parseInt(d.count, 10) || 0;
      });

      return formData;
    },

    loadExisting: function()
    {
      const date = this.$id('month').val();

      if (!date)
      {
        return;
      }

      const moment = time.utc.getMoment(`${date}-01`, 'YYYY-MM-DD');

      if (!moment.isValid())
      {
        return;
      }

      viewport.msg.loading();

      const req = this.ajax({
        url: `/osh/employments?_id<=${moment.valueOf()}&sort(-_id)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        const data = res.collection && res.collection[0] || {};

        if (data._id !== moment.toISOString())
        {
          data._id = undefined;
        }

        this.month = moment.format('YYYY-MM');

        this.model.set(data, {silent: true});
        this.render();
      });
    }

  });
});
