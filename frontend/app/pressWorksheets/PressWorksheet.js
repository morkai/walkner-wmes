define([
  'moment',
  '../core/Model'
], function(
  moment,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/pressWorksheets',

    clientUrlRoot: '#pressWorksheets',

    topicPrefix: 'pressWorksheets',

    privilegePrefix: 'PRESS_WORKSHEETS',

    nlsDomain: 'pressWorksheets',

    labelAttribute: '_id',

    defaults: function()
    {
      return {
        date: moment().format('YYYY-MM-DD'),
        shift: 1,
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
