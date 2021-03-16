// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/data/clipboard',
  'app/core/views/FormView',
  'app/core/util/sortByProps',
  'app/planning/util/contextMenu',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-targets/templates/form',
  'jquery.stickytableheaders'
], function(
  _,
  $,
  time,
  viewport,
  clipboard,
  FormView,
  sortByProps,
  contextMenu,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-month': 'loadExisting',
      'change #-blur': 'loadExistingNow',

      'change input[type="number"]': function(e)
      {
        if (!(e.currentTarget.value > 0))
        {
          e.currentTarget.value = 0;
        }
      },

      'keydown input': function(e)
      {
        if (e.key === 'Enter' || e.key === 'Space')
        {
          return false;
        }
      },

      'contextmenu td': function(e)
      {
        e.preventDefault();

        this.showContextMenu(e.currentTarget, e.pageY, e.pageX);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      const divisions = new Set();
      const workplaces = new Set();
      const departments = new Set();

      const orgUnits = this.model.serializeOrgUnits();

      orgUnits.forEach(ou =>
      {
        divisions.add(ou.division);
        workplaces.add(ou.workplace);
        departments.add(ou.department);
      });

      if (orgUnits.length === 0)
      {
        orgUnits.push(createOrgUnit('overall', 0, 0, 0));
      }

      dictionaries.departments.forEach(department =>
      {
        if (departments.has(department.id) || !department.get('active'))
        {
          return;
        }

        const workplace = dictionaries.workplaces.get(department.get('workplace'));

        if (!workplace || !workplace.get('active'))
        {
          return;
        }

        const division = dictionaries.divisions.get(workplace.get('division'));

        if (!division || !division.get('active'))
        {
          return;
        }

        if (!divisions.has(division.id))
        {
          orgUnits.push(createOrgUnit('division', division.id, 0, 0));
          divisions.add(division.id);
        }

        if (!workplaces.has(workplace.id))
        {
          orgUnits.push(createOrgUnit('workplace', division.id, workplace.id, 0));
          workplaces.add(workplace.id);
        }

        orgUnits.push(createOrgUnit('department', division.id, workplace.id, department.id));
      });

      orgUnits.sort(sortByProps(['divisionLabel', 'workplaceLabel', 'departmentLabel']));

      this.orgUnits = {};

      orgUnits.forEach(orgUnit =>
      {
        this.orgUnits[orgUnit.key] = {
          division: orgUnit.division,
          workplace: orgUnit.workplace,
          department: orgUnit.department,
          targets: orgUnit.targets
        };
      });

      return {
        orgUnits
      };

      function createOrgUnit(type, division, workplace, department)
      {
        return {
          type,
          key: `d${division}w${workplace}d${department}`,
          division,
          divisionLabel: dictionaries.getLabel('divisions', division),
          workplace,
          workplaceLabel: dictionaries.getLabel('workplaces', workplace),
          department,
          departmentLabel: dictionaries.getLabel('departments', department),
          targets: {
            minActiveUsers: 0,
            minObservers: 0,
            minObsCardsPerObserver: 0,
            minSafeObs: 0,
            maxSafeObs: 0,
            ipr: 0,
            ips: 0,
            trc: 0,
            contact: 0
          }
        };
      }
    },

    serializeToForm: function()
    {
      return {
        month: this.options.editMode ? time.utc.format(this.model.id, 'YYYY-MM') : (this.month || ''),
        orgUnits: this.orgUnits
      };
    },

    serializeForm: function(formData)
    {
      if (!this.options.editMode)
      {
        formData._id = formData.month + '-01T00:00:00Z';
      }

      delete formData.month;

      formData.orgUnits = Object.values(formData.orgUnits || {});

      formData.orgUnits.forEach(d =>
      {
        d.division = +d.division;
        d.workplace = +d.workplace;
        d.department = +d.department;

        Object.keys(d.targets).forEach(metric =>
        {
          d.targets[metric] = Math.round(parseFloat(d.targets[metric]) * 100) / 100;
        });
      });

      return formData;
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$('.table-responsive')
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
        url: `/osh/targets?_id<=${moment.valueOf()}&sort(-_id)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        if (!res.totalCount)
        {
          return;
        }

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

    showContextMenu: function(td, top, left)
    {
      const tr = td.parentNode;
      const input = td.querySelector('input[type="number"]');

      const menu = [
        this.t(`FORM:copy:${input ? 'specific' : 'all'}`)
      ];

      if (tr.dataset.workplace > 0)
      {
        menu.push({
          label: this.t('FORM:copy:workplace'),
          handler: () => this.copyValue(td, 'workplace')
        });
      }

      if (tr.dataset.division > 0)
      {
        menu.push({
          label: this.t('FORM:copy:division'),
          handler: () => this.copyValue(td, 'division')
        });
      }

      menu.push({
        label: this.t('FORM:copy:overall'),
        handler: () => this.copyValue(td, 'overall')
      });

      menu.push({
        label: this.t('FORM:copy:clipboard'),
        handler: () => this.copyValue(td, 'clipboard')
      });

      if (this.clipboardData)
      {
        const multi = this.clipboardData.startsWith('OSH_TARGETS');

        if (input || (!input && multi))
        {
          menu.push(this.t(`FORM:paste:${input ? 'single' : 'multi'}`));

          if (tr.dataset.department > 0)
          {
            menu.push({
              label: this.t('FORM:copy:department'),
              handler: () => this.copyValue(td, 'department', true)
            });
          }

          if (tr.dataset.workplace > 0)
          {
            menu.push({
              label: this.t('FORM:copy:workplace'),
              handler: () => this.copyValue(td, 'workplace', true)
            });
          }

          if (tr.dataset.division > 0)
          {
            menu.push({
              label: this.t('FORM:copy:division'),
              handler: () => this.copyValue(td, 'division', true)
            });
          }

          menu.push({
            label: this.t('FORM:copy:overall'),
            handler: () => this.copyValue(td, 'overall', true)
          });
        }
      }

      contextMenu.show(this, top, left, menu);
    },

    copyValue: function(td, type, paste)
    {
      const input = td.querySelector('input[type="number"]');

      if (type === 'clipboard')
      {
        clipboard.copy(clipboardData =>
        {
          if (input)
          {
            clipboardData.setData('text/plain', input.value.toLocaleString());

            this.clipboardData = input.value.toLocaleString();
          }
          else
          {
            const targets = ['OSH_TARGETS'];

            for (const input of td.parentNode.querySelectorAll('input[type="number"]'))
            {
              targets.push(`${input.name.split('.').pop()}=${input.value.toLocaleString()}`);
            }

            this.clipboardData = targets.join(' ');

            clipboardData.setData('text/plain', this.clipboardData);
          }

          clipboard.showTooltip({el: td, offsetTop: -30});
        });

        return;
      }

      if (input)
      {
        const metric = input.name.split('.').pop();
        const selector = (type === 'overall' ? '' : `tr[data-${type}="${td.parentNode.dataset[type]}"] `)
          + `input[name$="${metric}"]`;
        let value = input.value;

        if (paste)
        {
          if (this.clipboardData.startsWith('OSH_TARGETS'))
          {
            value = this.clipboardData.split(' ').find(part => part.startsWith(`${metric}=`)).split('=')[1];
          }
          else
          {
            value = this.clipboardData;
          }
        }

        this.$(selector).val(value);
      }
      else
      {
        const $source = this.$(td).closest('tr').find('input[type="number"]');
        const selector = type === 'overall' ? 'tr' : `tr[data-${type}="${td.parentNode.dataset[type]}"]`;

        this.$('tbody').find(selector).each((i, tr) =>
        {
          const $target = this.$(tr).find('input[type="number"]');

          $source.each((i, source) =>
          {
            $target[i].value = source.value;
          });
        });
      }

      if (!paste)
      {
        clipboard.showTooltip({el: td, offsetTop: -30});
      }
    }

  });
});
