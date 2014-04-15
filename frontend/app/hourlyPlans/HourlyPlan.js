// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

      if (!user.isAllowedTo('HOURLY_PLANS:MANAGE'))
      {
        return false;
      }

      var creator = this.get('creator');

      if (creator && user.data._id !== creator.id)
      {
        return false;
      }

      var userDivision = user.getDivision();

      if (!user.isAllowedTo('HOURLY_PLANS:ALL')
        && userDivision
        && userDivision.id !== this.get('division'))
      {
        return false;
      }

      var createdAt = Date.parse(this.get('createdAt'));

      return Date.now() < createdAt + 8 * 3600 * 1000;
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
      else
      {
        return;
      }

      this.trigger('change:flows');
      this.trigger('change');
    }

  });

});
