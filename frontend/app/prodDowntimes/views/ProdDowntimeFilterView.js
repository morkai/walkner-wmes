// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/data/aors',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/prodDowntimes/templates/filter'
], function(
  _,
  user,
  aors,
  orgUnits,
  downtimeReasons,
  FilterView,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({}, FilterView.prototype.events, {

      'change #-alerts': 'toggleStatus'

    }),

    defaultFormData: function()
    {
      return {
        startedAt: '',
        aor: null,
        aorIn: true,
        reason: null,
        reasonIn: true,
        status: null,
        orgUnit: null
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
      'division': function(propertyName, term, formData)
      {
        formData.orgUnit = term.args[1];
      },
      'alerts.active': function(propertyName, term, formData)
      {
        formData.alerts = true;
      },
      'reason': 'aor',
      'subdivision': 'division',
      'prodFlow': 'division'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('orgUnit').select2({
        width: '256px',
        allowClear: !user.getDivision() || user.isAllowedTo('PROD_DOWNTIMES:ALL'),
        data: this.getApplicableOrgUnits(),
        formatSelection: function(orgUnit)
        {
          if (orgUnit.type === 'subdivision')
          {
            return orgUnit.model.get('division') + ' \\ ' + orgUnit.text;
          }

          return orgUnit.text;
        }
      });

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
    },

    getApplicableOrgUnits: function()
    {
      var userOrgUnits = [];
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();
      var canAccessAll = user.isAllowedTo('PROD_DOWNTIMES:ALL');

      if (!canAccessAll && userDivision)
      {
        userOrgUnits.push({
          disabled: !!userSubdivision,
          id: userDivision.id,
          text: userDivision.getLabel(),
          type: 'division',
          model: userDivision,
          css: 'prodDowntime-filter-division'
        });
      }

      var view = this;

      if (!canAccessAll && userSubdivision)
      {
        this.pushApplicableOrgUnitsForSubdivision(userOrgUnits, userSubdivision);
      }
      else if (!canAccessAll && userDivision)
      {
        orgUnits.getChildren(userDivision).forEach(function(subdivision)
        {
          view.pushApplicableOrgUnitsForSubdivision(userOrgUnits, subdivision);
        });
      }
      else
      {
        orgUnits.getAllDivisions().forEach(function(division)
        {
          userOrgUnits.push({
            id: division.id,
            text: division.getLabel(),
            type: 'division',
            model: division,
            css: 'prodDowntime-filter-division'
          });

          orgUnits.getChildren(division).forEach(function(subdivision)
          {
            view.pushApplicableOrgUnitsForSubdivision(userOrgUnits, subdivision);
          });
        });
      }

      return userOrgUnits;
    },

    pushApplicableOrgUnitsForSubdivision: function(userOrgUnits, subdivision)
    {
      userOrgUnits.push({
        id: subdivision.id,
        text: subdivision.getLabel(),
        type: 'subdivision',
        model: subdivision,
        css: 'prodDowntime-filter-subdivision'
      });

      orgUnits.getProdFlowsForSubdivision(subdivision).forEach(function(prodFlow)
      {
        userOrgUnits.push({
          id: prodFlow.id,
          text: prodFlow.getLabel(),
          type: 'prodFlow',
          model: prodFlow,
          css: 'prodDowntime-filter-prodFlow'
        });
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var orgUnit = this.$id('orgUnit').select2('data');
      var aor = this.$id('aor').select2('val');
      var aorIn = this.$id('aorIn').prop('checked');
      var reason = this.$id('reason').select2('val');
      var reasonIn = this.$id('reasonIn').prop('checked');
      var alerts = this.$id('alerts').prop('checked');
      var status = this.fixStatus();

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

      if (orgUnit)
      {
        selector.push({name: 'eq', args: [orgUnit.type, orgUnit.id]});
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
