// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  './ObserverEditorDialogView',
  'app/wmes-osh-employments/templates/form',
  'jquery.stickytableheaders'
], function(
  _,
  $,
  time,
  viewport,
  FormView,
  dictionaries,
  ObserverEditorDialogView,
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
        if (!(e.currentTarget.value > 0))
        {
          e.currentTarget.value = 0;
        }

        const department = +this.$(e.currentTarget).closest('tr')[0].dataset.department;

        this.recountDepartment(department);
      },

      'click .js-observers': function(e)
      {
        e.currentTarget.blur();

        this.showObserverEditorDialog(
          this.$(e.target).closest('.js-department')[0].dataset.department
        );
      },

      'keydown input': function(e)
      {
        if (e.currentTarget.name.endsWith('observers'))
        {
          e.currentTarget.click();
        }

        if (e.key === 'Enter' || e.key === 'Space')
        {
          const department = +this.$(e.currentTarget).closest('tr')[0].dataset.department;

          this.recountDepartment(department);

          return false;
        }
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
        if (!d.division)
        {
          return;
        }

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
          observers: d.observers,
          observerUsers: d.observerUsers
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

      this.departments = {
        d0w0d0: {
          division: 0,
          workplace: 0,
          department: 0,
          internal: 0,
          external: 0,
          absent: 0,
          total: 0,
          observers: 0,
          observerUsers: '[]'
        }
      };

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
          observers: 0,
          observerUsers: '[]'
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
            observers: 0,
            observerUsers: '[]'
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
              observers: (department.observerUsers || []).length,
              observerUsers: JSON.stringify(department.observerUsers || [])
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
        d.observerUsers = d.observerUsers ? JSON.parse(d.observerUsers) : [];
      });

      return formData;
    },

    checkValidity: () => true,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.recountWorkplaces();
      this.recountDivisions();
      this.recountOverall();

      this.$el.popover({
        selector: '.js-observers',
        container: document.body,
        trigger: 'hover',
        html: true,
        hasContent: function()
        {
          return this.value > 0;
        },
        content: function()
        {
          return '<ol style="font-size: 12px; list-style-position: inside; padding-left: 0">'
            + JSON.parse(this.previousElementSibling.value).map(u => `<li>${_.escape(u.label)}`).join('')
            + '</ol>';
        }
      });
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
            observers: 0,
            observerUsers: []
          };
          const absent = +tr.querySelector('input[name$="absent"]').value;

          tr.querySelector('input[name$="internal"]').value = data.internal;
          tr.querySelector('input[name$="external"]').value = data.external;
          tr.querySelector('input[name$="total"]').value = data.internal + data.external - absent;
          tr.querySelector('input[name$="observers"]').value = data.observers;
          tr.querySelector('input[name$="observerUsers"]').value = JSON.stringify(data.observerUsers);
        });

        this.recountWorkplaces();
        this.recountDivisions();
        this.recountOverall();
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

    recountOverall: function()
    {
      const $overall = this.$id('overall');
      const data = {
        internal: 0,
        external: 0,
        absent: 0,
        total: 0,
        observers: 0
      };
      const props = Object.keys(data);

      this.$(`.js-division`).each((i, tr) =>
      {
        props.forEach(prop =>
        {
          data[prop] += parseInt(tr.querySelector(`input[name$="${prop}"]`).value, 10) || 0;
        });
      });

      props.forEach(prop =>
      {
        $overall.find(`input[name$="${prop}"]`).val(data[prop]);
      });
    },

    recountDivision: function(division)
    {
      const $division = this.$(`.js-division[data-division="${division}"]`);
      const data = {
        internal: 0,
        external: 0,
        absent: 0,
        total: 0,
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
        total: 0,
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
    },

    recountDepartment: function(department)
    {
      const $row = this.$(`.js-department[data-department="${department}"]`);

      const internal = +$row.find('input[name$="internal"]').val();
      const external = +$row.find('input[name$="external"]').val();
      const absent = +$row.find('input[name$="absent"]').val();

      $row.find('input[name$="total"]').val(internal + external - absent);

      this.recountWorkplace(+$row[0].dataset.workplace);
      this.recountDivision(+$row[0].dataset.division);
      this.recountOverall();
    },

    showObserverEditorDialog: function(department)
    {
      if (viewport.currentDialog instanceof ObserverEditorDialogView)
      {
        return;
      }

      const $row = this.$(`.js-department[data-department="${department}"]`);
      const $cells = $row.children();

      const dialogView = new ObserverEditorDialogView({
        model: {
          orgUnit: `${$cells[0].textContent} > ${$cells[1].textContent} > ${$cells[2].textContent}`,
          users: JSON.parse($row.find('input[name$="observerUsers"]').val())
        }
      });

      this.listenTo(dialogView, 'picked', (users) =>
      {
        viewport.closeDialog();

        $row.find('input[name$="observerUsers"]').val(JSON.stringify(users));
        $row.find('input[name$="observers"]').val(users.length).focus();

        this.recountDepartment(department);
      });

      this.broker.subscribe('viewport.dialog.hidden')
        .setLimit(1)
        .setFilter(d => d === dialogView)
        .on('message', () => $row.find('input[name$="observers"]').focus());

      viewport.showDialog(dialogView, this.t('observerEditor:title'));
    }

  });
});
