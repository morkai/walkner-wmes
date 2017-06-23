// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodDowntimeAlerts',

    clientUrlRoot: '#prodDowntimeAlerts',

    topicPrefix: 'prodDowntimeAlerts',

    privilegePrefix: 'PROD_DOWNTIME_ALERTS',

    nlsDomain: 'prodDowntimeAlerts',

    labelAttribute: 'name'

  }, {

    CONDITION_TYPES: [
      'reason',
      'aor',
      'division',
      'subdivision',
      'mrpController',
      'prodFlow',
      'workCenter',
      'prodLine'
    ]

  });
});
