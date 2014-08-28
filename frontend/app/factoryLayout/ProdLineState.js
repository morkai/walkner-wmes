// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  '../data/prodLines'
], function(
  Model,
  prodLines
) {
  'use strict';

  return Model.extend({

    urlRoot: '/production/state',

    clientUrlRoot: '#factoryLayout',

    topicPrefix: 'production',

    privilegePrefix: 'FACTORY_LAYOUT',

    nlsDomain: 'factoryLayout',

    defaults: {
      v: 0,
      state: null,
      stateChangedAt: 0,
      online: false,
      extended: false,
      quantitiesDone: [
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0},
        {planned: 0, actual: 0}
      ],
      plannedQuantityDone: 0,
      actualQuantityDone: 0,
      prodShiftId: null,
      prodShiftOrderId: null,
      prodDowntimeId: null
    },

    getLabel: function()
    {
      return this.id.substr(0, 10).toUpperCase().replace(/_$/, '').replace(/_/g, ' ');
    }

  });
});
