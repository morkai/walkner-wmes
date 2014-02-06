define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/data/orgUnits',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/data/downtimeReasons',
  'app/prodDowntimes/templates/filter',
  'i18n!app/nls/prodDowntimes',
  'select2'
], function(
  _,
  moment,
  js2form,
  reltime,
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

    initialize: function()
    {
      this.idPrefix = _.uniqueId('prodDowntimeFilter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.toggleStatus(formData.status);

      this.$id('orgUnit').select2({
        width: '275px',
        allowClear: !user.getDivision(),
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
        width: '275px',
        allowClear: true,
        data: this.getApplicableAors()
      });

      this.$id('reason').select2({
        width: '275px',
        allowClear: true,
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

      if (userDivision)
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

      if (userSubdivision)
      {
        this.pushApplicableOrgUnitsForSubdivision(userOrgUnits, userSubdivision);
      }
      else if (userDivision)
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

    getApplicableAors: function()
    {
      var userAors = user.data.aors || [];
      var result = [];

      if (userAors.length)
      {
        userAors.forEach(function(aorId)
        {
          var aor = aors.get(aorId);

          if (aor)
          {
            result.push({
              id: aorId,
              text: aor.getLabel()
            });
          }
        });
      }
      else
      {
        aors.each(function(aor)
        {
          result.push({
            id: aor.id,
            text: aor.getLabel()
          });
        });
      }

      return result;
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        startedAt: '',
        aor: null,
        reason: null,
        status: [],
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
            if (term.name === 'ge' || term.name === 'le')
            {
              formData[term.name === 'ge' ? 'from' : 'to'] =
                moment(term.args[1]).format('YYYY-MM-DD HH:mm:ss');
            }
            break;

          case 'aor':
          case 'reason':
            if (term.name === 'eq')
            {
              formData[property] = term.args[1];
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
      var timeRange = fixTimeRange(this.$id('from'), this.$id('to'), 'YYYY-MM-DD HH:mm:ss');
      var selector = [];
      var orgUnit = this.$id('orgUnit').select2('data');
      var aor = this.$id('aor').val();
      var reason = this.$id('reason').val();
      var status = this.fixStatus();

      if (aor && aor.length)
      {
        selector.push({name: 'eq', args: ['aor', aor]});
      }

      if (reason && reason.length)
      {
        selector.push({name: 'eq', args: ['reason', reason]});
      }

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length > 1)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (orgUnit)
      {
        selector.push({name: 'eq', args: [orgUnit.type, orgUnit.id]});
      }

      if (timeRange.from !== -1)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to !== -1)
      {
        selector.push({name: 'le', args: ['startedAt', timeRange.to]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    fixStatus: function()
    {
      var $allStatuses = this.$('.filter-btn-group > .btn');
      var $activeStatuses = $allStatuses.filter('.active');

      if ($activeStatuses.length === 0)
      {
        $allStatuses.addClass('active');
      }

      var selectedStatuses = $activeStatuses.map(function() { return this.value; }).get();

      return selectedStatuses.length === $allStatuses.length ? [] : selectedStatuses;
    },

    toggleStatus: function(statuses)
    {
      var $allStatuses = this.$('.filter-btn-group > .btn');

      if (statuses.length === 0)
      {
        $allStatuses.addClass('active');
      }
      else
      {
        statuses.forEach(function(severity)
        {
          $allStatuses.filter('[value="' + severity + '"]').addClass('active');
        });
      }
    }

  });
});
