// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/util/idAndLabel',
  'app/core/util/formatResultWithDescription',
  'app/data/downtimeReasons',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/production/templates/lineAutoDowntimeRow',
  'app/production/templates/settings'
], function(
  _,
  t,
  user,
  idAndLabel,
  formatResultWithDescription,
  downtimeReasons,
  orgUnits,
  SettingsView,
  lineAutoDowntimeRowTemplate,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#production;settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },
      'change #-lineAutoDowntimes-groups': function(e)
      {
        if (e.added)
        {
          this.selectAutoDowntimeGroup(e.added.id);
        }
        else
        {
          this.clearAutoDowntimeGroup();
        }
      },
      'change #-lineAutoDowntimes-group': 'updateAutoDowntimeGroupName',
      'input #-lineAutoDowntimes-group': 'updateAutoDowntimeGroupName',
      'change #-lineAutoDowntimes-lines': 'updateAutoDowntimeLines',
      'change #-lineAutoDowntimes-reasons': function(e)
      {
        if (!e.added)
        {
          return;
        }

        var autoDowntime = {
          reason: e.added.id,
          when: 'always',
          after: '',
          time: []
        };

        this.selectedAutoDowntimeGroup.downtimes.push(autoDowntime);

        this.addAutoDowntimeRow(autoDowntime);
        this.scheduleAutoDowntimeSave();

        this.$id('lineAutoDowntimes-reasons').select2('val', null);
      },
      'click .btn[data-auto-downtime-action="up"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $prev = $tr.prev();

        if ($prev.length)
        {
          $tr.insertBefore($prev);
          this.updateAutoDowntimes();
        }
      },
      'click .btn[data-auto-downtime-action="down"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $next = $tr.next();

        if ($next.length)
        {
          $tr.insertAfter($next);
          this.updateAutoDowntimes();
        }
      },
      'click .btn[data-auto-downtime-action="remove"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr').fadeOut('fast', () =>
        {
          $tr.remove();
          this.updateAutoDowntimes();
        });
      },
      'change [name$="when"]': function(e)
      {
        this.toggleAutoDowntimeOptions(this.$(e.currentTarget).closest('tr'));
        this.updateAutoDowntimes();
      },
      'change [name$="after"]': function(e)
      {
        this.toggleAutoDowntimeOptions(this.$(e.currentTarget).closest('tr'));
        this.updateAutoDowntimes();
      },
      'change [name$="time"]': function(e)
      {
        var re = /(?:([0-9]+)\s*@\s*)?([0-9]{1,2}):([0-9]{1,2})/g;
        var matches;
        var times = [];

        while ((matches = re.exec(e.target.value)) !== null) // eslint-disable-line no-cond-assign
        {
          var duration = +matches[1] || 0;

          if (duration < 0)
          {
            duration = 0;
          }
          else if (duration > 480)
          {
            duration = 480;
          }

          var hour = +matches[2];

          if (hour >= 24)
          {
            continue;
          }

          var minutes = +matches[3];

          if (minutes >= 60)
          {
            continue;
          }

          if (hour < 10)
          {
            hour = '0' + hour;
          }

          if (minutes < 10)
          {
            minutes = '0' + minutes;
          }

          times.push((duration ? (duration + '@') : '') + hour + ':' + minutes);
        }

        e.target.value = times.join(', ');

        this.updateAutoDowntimes();
      }
    }, SettingsView.prototype.events),

    initialize: function()
    {
      SettingsView.prototype.initialize.apply(this, arguments);

      this.autoDowntimeI = 0;

      this.selectedAutoDowntimeGroup = null;
    },

    getTemplateData: function()
    {
      var onlySpigot = !user.isAllowedTo('SUPER') && user.isAllowedTo('PROD_DATA:MANAGE:SPIGOT_ONLY');

      return {
        subtabs: onlySpigot ? [{_id: 'spigot'}] : [
          {_id: 'taktTime'},
          {_id: 'downtimes'},
          {_id: 'spigot'},
          {_id: 'bomChecker', redirect: '#orderBomMatchers'},
          {_id: 'componentLabels', redirect: '#componentLabels'}
        ],
        onlySpigot
      };
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      const downtimes = downtimeReasons.map(idAndLabel);
      const activeLines = orgUnits.getActiveByType('prodLine')
        .map(idAndLabel)
        .sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}));

      this.$id('rearmDowntimeReason').select2({
        allowClear: true,
        placeholder: ' ',
        data: downtimes
      });

      this.$id('spigotLines').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: activeLines
      });

      this.$id('taktTime-ignoredLines').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: activeLines
      });

      this.$id('taktTime-ignoredDowntimes').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: downtimes
      });

      this.setUpAutoDowntimeGroups();

      this.$id('lineAutoDowntimes-reasons').select2({
        width: '400px',
        placeholder: this.t('settings:lineAutoDowntimes:reasons:placeholder'),
        data: downtimeReasons.map(d =>
        {
          return {
            id: d.id,
            text: d.id + ' - ' + d.getLabel()
          };
        })
      });

      this.$id('lineAutoDowntimes-lines').select2({
        placeholder: ' ',
        multiple: true,
        data: orgUnits.getActiveByType('prodLine')
          .filter(prodLine =>
          {
            const subdivision = orgUnits.getSubdivisionFor(prodLine);

            return subdivision && subdivision.get('type') === 'assembly';
          })
          .map(idAndLabel)
          .sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}))
      });

      if (this.selectedAutoDowntimeGroup)
      {
        this.selectAutoDowntimeGroup(this.selectedAutoDowntimeGroup.id);
      }
      else
      {
        this.clearAutoDowntimeGroup();
      }

      this.resizeTaktTimeCoeffs();
    },

    resizeTaktTimeCoeffs: function()
    {
      const $textarea = this.$id('taktTime-coeffs');

      $textarea.prop('rows', ($textarea.val() || '').split('\n').length + 5);
    },

    setUpAutoDowntimeGroups: function()
    {
      this.$id('lineAutoDowntimes-groups').select2({
        allowClear: true,
        placeholder: this.t('settings:lineAutoDowntimes:groups:placeholder'),
        data: (this.settings.getValue('lineAutoDowntimes') || []).map(lineAutoDowntime =>
        {
          return {
            id: lineAutoDowntime.id,
            text: lineAutoDowntime.name,
            lines: lineAutoDowntime.lines.join(', ')
          };
        }),
        formatResult: formatResultWithDescription.bind(null, 'text', 'lines')
      });

      if (this.selectedAutoDowntimeGroup)
      {
        this.$id('lineAutoDowntimes-groups').select2('val', this.selectedAutoDowntimeGroup.id);
      }
    },

    selectAutoDowntimeGroup: function(groupId)
    {
      const group = _.find(
        this.settings.getValue('lineAutoDowntimes'),
        group => group.id === groupId
      );

      if (!group)
      {
        return;
      }

      this.$id('lineAutoDowntimes-groups').select2('val', group.id);
      this.$id('lineAutoDowntimes-group').val(group.name);
      this.$id('lineAutoDowntimes-lines').select2('val', group.lines);
      this.$id('lineAutoDowntimes-body').html('');

      group.downtimes.forEach(this.addAutoDowntimeRow, this);

      this.selectedAutoDowntimeGroup = _.clone(group);
    },

    addAutoDowntimeRow: function(autoDowntime)
    {
      const $row = this.renderPartial(lineAutoDowntimeRowTemplate, {
        autoDowntime: {
          i: ++this.autoDowntimeI,
          reason: idAndLabel(downtimeReasons.get(autoDowntime.reason)),
          when: autoDowntime.when,
          after: autoDowntime.after || '',
          time: autoDowntime.time
            .map(time =>
            {
              return (time.d > 0 ? `${time.d}@` : '')
                + time.h.toString().padStart(2, '0')
                + ':'
                + time.m.toString().padStart(2, '0');
            })
            .join(', ')
        }
      });

      this.$id('lineAutoDowntimes-body').append($row);

      $row.find('input[name$="after"]').select2({
        width: '400px',
        placeholder: this.t('settings:lineAutoDowntimes:when:after:placeholder'),
        data: downtimeReasons
          .filter(r => r.id !== autoDowntime.reason)
          .map(idAndLabel)
      });

      this.toggleAutoDowntimeOptions($row);
    },

    toggleAutoDowntimeOptions: function($row)
    {
      const when = $row.find('select[name$="when"]').val();
      const $after = $row.find('input[name$="after"]');
      const $time = $row.find('input[name$="time"]');

      $after.select2('container').toggleClass('hidden', when !== 'after');
      $time.toggleClass('hidden', when !== 'time');
    },

    clearAutoDowntimeGroup: function()
    {
      this.$id('lineAutoDowntimes-groups').select2('val', null);
      this.$id('lineAutoDowntimes-group').val('');
      this.$id('lineAutoDowntimes-lines').select2('val', []);
      this.$id('lineAutoDowntimes-body').html('');

      this.selectedAutoDowntimeGroup = {
        id: Date.now().toString(36).toUpperCase()
          + Math.round(1000000 + Math.random() * 8999998).toString(36).toUpperCase(),
        name: '',
        lines: [],
        downtimes: []
      };
    },

    updateAutoDowntimeGroupName: function()
    {
      this.selectedAutoDowntimeGroup.name = this.$id('lineAutoDowntimes-group').val();

      this.scheduleAutoDowntimeSave();
    },

    updateAutoDowntimeLines: function()
    {
      var lines = this.$id('lineAutoDowntimes-lines').val();

      this.selectedAutoDowntimeGroup.lines = lines.length ? lines.split(',') : [];

      this.scheduleAutoDowntimeSave();
    },

    updateAutoDowntimes: function()
    {
      const downtimes = [];

      this.$id('lineAutoDowntimes-body').find('tr').each(function()
      {
        const dt = {
          reason: this.querySelector('[name$="reason"]').value,
          when: this.querySelector('[name$="when"]').value,
          after: this.querySelector('[name$="after"]').value,
          time: this.querySelector('[name$="time"]').value.split(',').map(time =>
          {
            var matches = time.match(/(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/);

            return !matches ? null : {
              h: +matches[2],
              m: +matches[3],
              d: +matches[1] || 0
            };
          }).filter(v => !!v)
        };

        if (dt.when !== 'after')
        {
          dt.after = '';
        }

        if (dt.when !== 'time')
        {
          dt.time = [];
        }

        downtimes.push(dt);
      });

      this.selectedAutoDowntimeGroup.downtimes = downtimes;

      this.scheduleAutoDowntimeSave();
    },

    scheduleAutoDowntimeSave: function()
    {
      if (this.saveAutoDowntimesTimer)
      {
        clearTimeout(this.saveAutoDowntimesTimer);
      }

      this.saveAutoDowntimesTimer = setTimeout(this.saveAutoDowntimes.bind(this), 1000);
    },

    saveAutoDowntimes: function()
    {
      this.saveAutoDowntimesTimer = null;

      let lineAutoDowntimes = [].concat(this.settings.getValue('lineAutoDowntimes') || []);
      const selectedGroup = this.selectedAutoDowntimeGroup;
      const groupIndex = _.findIndex(lineAutoDowntimes, group => group.id === selectedGroup.id);
      const existingGroup = lineAutoDowntimes[groupIndex];

      if (existingGroup)
      {
        lineAutoDowntimes[groupIndex] = selectedGroup;
      }
      else
      {
        lineAutoDowntimes.push(selectedGroup);
        lineAutoDowntimes.sort((a, b) => a.name.localeCompare(b.name));
      }

      lineAutoDowntimes = lineAutoDowntimes.filter(group =>
      {
        return group.name.length > 0
          && group.lines.length > 0
          && group.downtimes.length > 0;
      });

      if (!existingGroup)
      {
        this.setUpAutoDowntimeGroups();
        this.$id('lineAutoDowntimes-groups').select2('val', selectedGroup.id);
      }

      this.updateSetting('production.lineAutoDowntimes', lineAutoDowntimes);
    },

    updateSetting: function(id)
    {
      if (!/^lineAutoDowntime/.test(id))
      {
        SettingsView.prototype.updateSetting.apply(this, arguments);
      }
    },

    updateSettingField: function(setting)
    {
      if (setting.id === 'production.lineAutoDowntimes')
      {
        this.updateLineAutoDowntimesFields();
      }
    },

    updateLineAutoDowntimesFields: function()
    {
      this.setUpAutoDowntimeGroups();

      const oldSelectedGroup = this.selectedAutoDowntimeGroup;
      const newSelectedGroup = _.find(
        this.settings.getValue('lineAutoDowntimes'),
          group => group.id === oldSelectedGroup.id
      );

      if (!newSelectedGroup)
      {
        return;
      }

      if (_.isEqual(oldSelectedGroup, newSelectedGroup))
      {
        return;
      }

      this.selectAutoDowntimeGroup(newSelectedGroup.id);
    }

  });
});
