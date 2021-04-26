// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/orgUnits/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/subdivisions/templates/form',
  'app/subdivisions/templates/autoDowntimeRow'
], function(
  _,
  $,
  time,
  aors,
  downtimeReasons,
  OrgUnitDropdownsView,
  FormView,
  idAndLabel,
  template,
  autoDowntimeRowTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign(FormView.prototype.events, {

      'click #-addAutoDowntime': function()
      {
        var $reason = this.$id('autoDowntimeReason');
        var reason = $reason.val();

        if (reason)
        {
          this.addAutoDowntime({
            reason: reason,
            when: 'always',
            after: '',
            time: []
          });
        }

        $reason.select2('val', null).select2('focus');
      },
      'click .btn[data-auto-downtime-action="up"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $prev = $tr.prev();

        if ($prev.length)
        {
          $tr.insertBefore($prev);
        }
      },
      'click .btn[data-auto-downtime-action="down"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr');
        var $next = $tr.next();

        if ($next.length)
        {
          $tr.insertAfter($next);
        }
      },
      'click .btn[data-auto-downtime-action="remove"]': function(e)
      {
        var $tr = this.$(e.target).closest('tr').fadeOut('fast', function()
        {
          $tr.remove();
        });
      },
      'change [name$="when"]': function(e)
      {
        this.toggleAutoDowntimeOptions(this.$(e.currentTarget).closest('tr'));
      },
      'change [name$="after"]': function(e)
      {
        this.toggleAutoDowntimeOptions(this.$(e.currentTarget).closest('tr'));
      },
      'change [name$="time"]': function(e)
      {
        var re = /(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/g;
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
      }

    }),

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.autoDowntimeI = 0;

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.DIVISION,
        required: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var oudv = this.orgUnitDropdownsView;

      this.listenToOnce(oudv, 'afterRender', function()
      {
        oudv.selectValue(this.model).focus();
        oudv.$id('division').select2('enable', !this.options.editMode);
      });

      this.$id('prodTaskTags').select2({
        tags: this.model.allTags || [],
        tokenSeparators: [',']
      });

      this.$id('aor').select2({
        placeholder: ' ',
        allowClear: true,
        data: aors.map(idAndLabel)
      });

      this.$id('autoDowntimeReason').select2({
        width: '400px',
        allowClear: false,
        data: downtimeReasons.map(function(reason)
        {
          return {
            id: reason.id,
            text: reason.id + ' - ' + reason.getLabel()
          };
        })
      });

      this.model.get('autoDowntimes').forEach(this.addAutoDowntime, this);
    },

    serializeToForm: function()
    {
      var data = this.model.toJSON();

      data.prodTaskTags = data.prodTaskTags ? data.prodTaskTags.join(',') : '';

      if (data.deactivatedAt)
      {
        data.deactivatedAt = time.format(data.deactivatedAt, 'YYYY-MM-DD');
      }

      return data;
    },

    serializeForm: function(data)
    {
      data.prodTaskTags = typeof data.prodTaskTags === 'string' ? data.prodTaskTags.split(',') : [];
      data.aor = aors.get(data.aor) ? data.aor : null;

      if (!data.autoDowntimes)
      {
        data.autoDowntimes = [];
      }

      _.forEach(data.autoDowntimes, function(autoDowntime)
      {
        if (autoDowntime.when === 'time')
        {
          autoDowntime.time = autoDowntime.time.split(',').map(function(time)
          {
            var matches = time.match(/(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/);

            return {
              h: +matches[2],
              m: +matches[3],
              d: +matches[1] || 0
            };
          });
        }
        else
        {
          autoDowntime.time = [];
        }

        if (autoDowntime.when !== 'after')
        {
          autoDowntime.after = '';
        }
      });

      var deactivatedAt = time.getMoment(data.deactivatedAt || null);

      data.deactivatedAt = deactivatedAt.isValid() ? deactivatedAt.toISOString() : null;

      return data;
    },

    addAutoDowntime: function(autoDowntime)
    {
      var $autoDowntimes = this.$id('autoDowntimes');
      var $existing = $autoDowntimes.find('input[value="' + autoDowntime.reason + '"]');

      if ($existing.length)
      {
        return;
      }

      const $row = this.renderPartial(autoDowntimeRowTemplate, {
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

      this.$id('autoDowntimes').append($row);

      $row.find('input[name$="after"]').select2({
        width: '400px',
        placeholder: this.t('autoDowntimes:when:after:placeholder'),
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
    }

  });
});
