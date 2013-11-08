define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  var SEVERITY_TO_CLASS_NAME_MAP = {
    debug: 'debug',
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger'
  };

  return Model.extend({

    urlRoot: '/events',

    clientUrlRoot: '#events',

    labelProperty: 'type',

    nlsDomain: 'events',

    defaults: {
      time: 0,
      user: null,
      type: 'unknown',
      severity: 'info',
      data: null
    },

    getSeverityClassName: function()
    {
      return SEVERITY_TO_CLASS_NAME_MAP[this.get('severity')];
    }

  });
});
