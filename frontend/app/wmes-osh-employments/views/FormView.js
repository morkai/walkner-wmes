// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-employments/templates/form',
  'jquery.stickytableheaders'
], function(
  $,
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

      'click #-doRecount': 'recount',

      'change input[type="number"]': function(e)
      {
        const $tr = this.$(e.target).closest('tr');
        const divisionId = $tr[0].dataset.division;
        const workplaceId = $tr[0].dataset.workplace;

        clearTimeout(this.timers[`recount${workplaceId}`]);
        this.timers[`recount${workplaceId}`] = setTimeout(() =>
        {
          this.recountWorkplace(workplaceId);
          this.recountDivision(divisionId);
        }, 333);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      const divisions = new Map();
      const workplaces = new Map();
      const departments = new Set();

      (this.model.get('departments') || []).forEach(d =>
      {
        if (!divisions.has(d.division))
        {
          divisions.set(d.division, {
            key: `d${d.division}w0d0`,
            _id: d.division,
            label: dictionaries.getLabel('divisions', d.division),
            workplaces: []
          });
        }

        if (!d.workplace)
        {
          return;
        }

        const division = divisions.get(d.division);

        if (!workplaces.has(d.workplace))
        {
          const workplace = {
            key: `d${d.division}w${d.workplace}d0`,
            _id: d.workplace,
            label: dictionaries.getLabel('workplaces', d.workplace),
            departments: []
          };

          workplaces.set(d.workplace, workplace);

          division.workplaces.push(workplace);
        }

        if (!d.department)
        {
          return;
        }

        workplaces.get(d.workplace).departments.push({
          key: `d${d.division}w${d.workplace}d${d.department}`,
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
        let divisionId = 0;

        if (!workplaces.has(workplaceId))
        {
          const workplaceModel = dictionaries.workplaces.get(workplaceId);

          if (!workplaceModel)
          {
            return;
          }

          divisionId = workplaceModel.get('division');

          const divisionModel = dictionaries.divisions.get(divisionId);

          if (!divisionModel)
          {
            return;
          }

          const workplace = {
            key: `d${divisionId}w${workplaceId}d0`,
            _id: workplaceId,
            label: dictionaries.getLabel('workplaces', workplaceId),
            departments: []
          };

          workplaces.set(workplaceId, workplace);

          if (!divisions.has(divisionId))
          {
            divisions.set(divisionId, {
              key: `d${divisionId}w0d0`,
              _id: divisionId,
              label: dictionaries.getLabel('divisions', divisionId),
              workplaces: []
            });
          }

          divisions.get(divisionId).workplaces.push(workplace);
        }

        workplaces.get(workplaceId).departments.push({
          key: `d${divisionId}w${workplaceId}d${department.id}`,
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

      divisions.forEach(division =>
      {
        division.workplaces.sort((a, b) => a.label.localeCompare(
          b.label, undefined, {numeric: true, ignorePunctuation: true}
        ));

        this.departments[division.key] = {
          division: division._id,
          workplace: 0,
          department: 0,
          internal: 0,
          external: 0,
          absent: 0,
          total: 0,
          observers: 0
        };

        division.workplaces.forEach(workplace =>
        {
          workplace.departments.sort((a, b) => a.label.localeCompare(
            b.label, undefined, {numeric: true, ignorePunctuation: true}
          ));

          this.departments[workplace.key] = {
            division: division._id,
            workplace: workplace._id,
            department: 0,
            internal: 0,
            external: 0,
            absent: 0,
            total: 0,
            observers: 0
          };

          workplace.departments.forEach(department =>
          {
            this.departments[department.key] = {
              division: division._id,
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
      });

      return {
        divisions: Array.from(divisions.values()).sort((a, b) => a.label.localeCompare(
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

      this.recountWorkplaces();
      this.recountDivisions();
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$el
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$('.table').stickyTableHeaders('destroy');
      });
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

        this.$('.js-department').each((i, tr) =>
        {
          const data = res[tr.dataset.department] || {
            internal: 0,
            external: 0,
            observers: 0
          };

          tr.querySelector('input[name$="internal"]').value = data.internal;
          tr.querySelector('input[name$="external"]').value = data.external;
          tr.querySelector('input[name$="observers"]').value = data.observers;
        });

        this.recountWorkplaces();
        this.recountDivisions();
      });

      req.always(() =>
      {
        this.$id('enableRecount').prop('disabled', false);
        this.$id('doRecount').prop('disabled', false);
      });
    },

    recountDivisions: function()
    {
      this.$('.js-division').each((i, tr) =>
      {
        this.recountDivision(tr.dataset.division);
      });
    },

    recountWorkplaces: function()
    {
      this.$('.js-workplace').each((i, tr) =>
      {
        this.recountWorkplace(tr.dataset.workplace);
      });
    },

    recountDivision: function(division)
    {
      const $division = this.$(`.js-division[data-division="${division}"]`);
      const data = {
        internal: 0,
        external: 0,
        absent: 0,
        observers: 0
      };
      const props = Object.keys(data);

      this.$(`.js-workplace[data-division="${division}"]`).each((i, tr) =>
      {
        props.forEach(prop =>
        {
          data[prop] += parseInt(tr.querySelector(`input[name$="${prop}"]`).value, 10) || 0;
        });
      });

      props.forEach(prop =>
      {
        $division.find(`input[name$="${prop}"]`).val(data[prop]);
      });
    },

    recountWorkplace: function(workplace)
    {
      const $workplace = this.$(`.js-workplace[data-workplace="${workplace}"]`);
      const data = {
        internal: 0,
        external: 0,
        absent: 0,
        observers: 0
      };
      const props = Object.keys(data);

      this.$(`.js-department[data-workplace="${workplace}"]`).each((i, tr) =>
      {
        props.forEach(prop =>
        {
          data[prop] += parseInt(tr.querySelector(`input[name$="${prop}"]`).value, 10) || 0;
        });
      });

      props.forEach(prop =>
      {
        $workplace.find(`input[name$="${prop}"]`).val(data[prop]);
      });
    }

  });
});
