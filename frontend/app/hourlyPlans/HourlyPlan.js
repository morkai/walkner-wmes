define([
  'moment',
  '../data/divisions',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  moment,
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
      locked: false,
      createdAt: null,
      creatorId: null,
      creatorLabel: null,
      updatedAt: null,
      updaterId: null,
      updaterLabel: null
    },

    serialize: function()
    {
      var division = divisions.get(this.get('division'));

      return {
        division: division ? renderOrgUnitPath(division, false, false) : '?',
        date: moment(this.get('date')).format('LL'),
        shift: this.get('shift'),
        flows: this.get('flows'),
        locked: !!this.get('locked')
      };
    }

  });

});
