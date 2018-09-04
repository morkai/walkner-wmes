// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/data/aors',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/prodDowntimes/templates/filter'
], function(
  _,
  user,
  aors,
  orgUnits,
  downtimeReasons,
  FilterView,
  fixTimeRange,
  OrgUnitPickerView,
  setUpMrpSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({

      'change #-alerts': 'toggleStatus'

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        startedAt: '',
        aor: null,
        aorIn: true,
        reason: null,
        reasonIn: true,
        status: null,
        mrp: ''
      };
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'aor': function(propertyName, term, formData)
      {
        if (term.name === 'eq' || term.name === 'ne')
        {
          formData[propertyName + 'In'] = term.name === 'eq';
          formData[propertyName] = term.args[1];
        }
        else if (term.name === 'in' || term.name === 'nin')
        {
          formData[propertyName + 'In'] = term.name === 'in';
          formData[propertyName] = term.args[1].join(',');
        }
      },
      'status': function(propertyName, term, formData)
      {
        formData.status = [].concat(term.args[1]);
      },
      'alerts.active': function(propertyName, term, formData)
      {
        formData.alerts = 1;
      },
      'orderData.mrp': function(propertyName, term, formData)
      {
        formData.mrp = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      },
      'reason': 'aor'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('aor').select2({
        width: '256px',
        allowClear: true,
        multiple: true,
        data: aors
          .map(function(aor)
          {
            return {
              id: aor.id,
              text: aor.getLabel()
            };
          })
          .sort(function(a, b)
          {
            return a.text.localeCompare(b.text);
          })
      });

      this.$id('reason').select2({
        width: '256px',
        allowClear: true,
        multiple: true,
        data: downtimeReasons
          .map(function(downtimeReason)
          {
            return {
              id: downtimeReason.id,
              text: downtimeReason.id + ' - ' + (downtimeReason.get('label') || '?')
            };
          })
          .sort(function(a, b)
          {
            return a.id.localeCompare(b.id);
          })
      });

      this.toggleStatus();

      setUpMrpSelect2(this.$id('mrp'), {
        own: true,
        view: this,
        width: '256px'
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var aor = this.$id('aor').select2('val');
      var aorIn = this.$id('aorIn').prop('checked');
      var reason = this.$id('reason').select2('val');
      var reasonIn = this.$id('reasonIn').prop('checked');
      var alerts = this.$id('alerts').prop('checked');
      var status = this.fixStatus();
      var mrp = this.$id('mrp').val();

      if (alerts)
      {
        selector.push({name: 'eq', args: ['alerts.active', true]});
      }
      else if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length > 1)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['orderData.mrp', mrp.split(',')]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['startedAt', timeRange.to]});
      }

      if (aor.length === 1)
      {
        selector.push({name: aorIn ? 'eq' : 'ne', args: ['aor', aor[0]]});
      }
      else if (aor.length > 1)
      {
        selector.push({name: aorIn ? 'in' : 'nin', args: ['aor', aor]});
      }

      if (reason.length === 1)
      {
        selector.push({name: reasonIn ? 'eq' : 'ne', args: ['reason', reason[0]]});
      }
      else if (reason.length > 1)
      {
        selector.push({name: reasonIn ? 'in' : 'nin', args: ['reason', reason]});
      }
    },

    fixStatus: function()
    {
      var $allStatuses = this.$('input[name="status[]"]');
      var $activeStatuses = $allStatuses.filter(':checked');

      if ($activeStatuses.length === 0)
      {
        $activeStatuses = $allStatuses.prop('checked', true);
      }

      var selectedStatuses = $activeStatuses.map(function() { return this.value; }).get();

      return selectedStatuses.length === $allStatuses.length ? [] : selectedStatuses;
    },

    toggleStatus: function()
    {
      this.$('[name="status[]"]').prop('disabled', this.$id('alerts').prop('checked'));
    }

  });
});
