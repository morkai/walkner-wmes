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

      'change #-month': 'loadExisting',
      'change #-blur': 'loadExistingNow',

      'change #-enableRecount': function(e)
      {
        this.$id('doRecount').prop('disabled', !e.target.checked);
      },

      'click #-doRecount': 'recount'

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
          internal: d.internal,
          external: d.external,
          absent: d.absent,
          total: d.total,
          observers: d.observers
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
          internal: 0,
          external: 0,
          absent: 0,
          total: 0,
          observers: 0
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
            internal: department.internal,
            external: department.external,
            absent: department.absent,
            total: department.total,
            observers: department.observers
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
        month: this.options.editMode ? time.utc.format(this.model.id, 'YYYY-MM') : (this.month || ''),
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
        d.internal = parseInt(d.internal, 10) || 0;
        d.external = parseInt(d.external, 10) || 0;
        d.absent = parseInt(d.absent, 10) || 0;
        d.total = d.internal + d.external - d.absent;
        d.observers = parseInt(d.observers, 10) || 0;
      });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);
    },

    loadExisting: function()
    {
      clearTimeout(this.timers.loadExisting);
      this.timers.loadExisting = setTimeout(this.loadExistingNow.bind(this), 333);
    },

    loadExistingNow: function()
    {
      clearTimeout(this.timers.loadExisting);

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
    },

    recount: function()
    {
      viewport.msg.loading();

      this.$id('enableRecount').prop('disabled', true);
      this.$id('doRecount').prop('disabled', true);

      const req = this.ajax({
        url: '/osh/employments;recount'
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        this.$('tr[data-id]').each((i, tr) =>
        {
          const data = res[tr.dataset.id] || {internal: 0, observers: 0};

          tr.querySelector('input[name$="internal"]').value = data.internal;
          tr.querySelector('input[name$="observers"]').value = data.observers;
        });
      });

      req.always(() =>
      {
        this.$id('enableRecount').prop('disabled', false);
        this.$id('doRecount').prop('disabled', false);
      });
    }

  });
});
