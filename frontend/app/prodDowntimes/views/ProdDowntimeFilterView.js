// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/data/orgUnits',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/data/downtimeReasons',
  'app/prodDowntimes/templates/filter',
  'select2'
], function(
  js2form,
  t,
  user,
  aors,
  orgUnits,
  View,
  fixTimeRange,
  downtimeReasons,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

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

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        startedAt: '',
        aor: null,
        aorIn: true,
        reason: null,
        reasonIn: true,
        status: ['undecided', 'confirmed', 'rejected'],
        orgUnit: null,
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'startedAt':
            fixTimeRange.toFormData(formData, term, 'date+time');
            break;

          case 'aor':
          case 'reason':
            if (term.name === 'eq' || term.name === 'ne')
            {
              formData[property + 'In'] = term.name === 'eq';
              formData[property] = term.args[1];
            }
            else if (term.name === 'in' || term.name === 'nin')
            {
              formData[property + 'In'] = term.name === 'in';
              formData[property] = term.args[1].join(',');
            }
            break;

          case 'status':
            formData.status = [].concat(term.args[1]);
            break;

          case 'division':
          case 'subdivision':
          case 'prodFlow':
            formData.orgUnit = term.args[1];
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var selector = [];
      var orgUnit = this.$id('orgUnit').select2('data');
      var aor = this.$id('aor').select2('val');
      var aorIn = this.$id('aorIn').prop('checked');
      var reason = this.$id('reason').select2('val');
      var reasonIn = this.$id('reasonIn').prop('checked');
      var status = this.fixStatus();

      if (status.length === 1)
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

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
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
    }

  });
});
