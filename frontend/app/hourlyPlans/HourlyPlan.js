// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../data/divisions',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  t,
  time,
  divisions,
  renderOrgUnitPath,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/hourlyPlans',

    clientUrlRoot: '#hourlyPlans',

    topicPrefix: 'hourlyPlans',

    privilegePrefix: 'HOURLY_PLANS',

    nlsDomain: 'hourlyPlans',

    defaults: {
      division: null,
      date: null,
      shift: null,
      flows: null,
      createdAt: null,
      creator: null,
      updatedAt: null,
      updater: null
    },

    getLabel: function()
    {
      return this.get('division') + ', ' + time.format(this.get('date'), 'LL');
    },

    serialize: function()
    {
      var division = divisions.get(this.get('division'));

      return {
        division: division ? renderOrgUnitPath(division, false, false) : '?',
        date: time.format(this.get('date'), 'LL'),
        shift: t('core', 'SHIFT:' + this.get('shift')),
        flows: this.get('flows')
      };
    },

    isEditable: function(user)
    {
      if (user.isAllowedTo('PROD_DATA:MANAGE'))
      {
        return true;
      }

      if (!user.isAllowedTo(this.getPrivilegePrefix() + ':MANAGE'))
      {
        return false;
      }

      var now = Date.now();
      var date = Date.parse(this.get('date')) + 24 * 3600 * 1000;

      if (now > date)
      {
        var createdAt = Date.parse(this.get('createdAt'));

        if (now >= createdAt + 8 * 3600 * 1000)
        {
          return false;
        }
      }

      var userDivision = user.getDivision();

      if (!userDivision || user.isAllowedTo(this.getPrivilegePrefix() + ':ALL'))
      {
        return true;
      }

      var entryDivisionId = this.get('division');

      return entryDivisionId === userDivision.id;
    },

    handleUpdateMessage: function(message)
    {
      var flows = this.get('flows');

      if (!flows)
      {
        return;
      }

      var flow = flows[message.flowIndex];

      if (!flow)
      {
        return;
      }

      if (message.type === 'plan')
      {
        flow.noPlan = message.newValue;
        flow.level = 0;
        flow.hours = flow.hours.map(function() { return 0; });
      }
      else if (message.type === 'count')
      {
        if (typeof message.hourIndex === 'number')
        {
          flow.hours[message.hourIndex] = message.newValue;
        }
        else
        {
          flow.level = message.newValue;
        }
      }
      else if (message.type === 'counts')
      {
        flow.hours = message.newValues;
      }
      else
      {
        return;
      }

      this.trigger('change:flows');
      this.trigger('change');
    }

  });
});
