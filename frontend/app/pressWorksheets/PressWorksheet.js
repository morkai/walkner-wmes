define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/pressWorksheets',

    clientUrlRoot: '#pressWorksheets',

    topicPrefix: 'pressWorksheets',

    privilegePrefix: 'PRESS_WORKSHEETS',

    nlsDomain: 'pressWorksheets',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        rid: null,
        date: time.format('YYYY-MM-DD'),
        shift: 1,
        type: 'mech',
        startedAt: null,
        finishedAt: null,
        master: null,
        operator: null,
        operators: null,
        orders: null,
        createdAt: null,
        creator: null
      };
    }

  });
});
