// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model'
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

    topicPrefix: 'events',

    privilegePrefix: 'EVENTS',

    nlsDomain: 'events',

    labelAttribute: 'type',

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
