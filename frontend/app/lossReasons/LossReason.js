// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/lossReasons',

    clientUrlRoot: '#lossReasons',

    topicPrefix: 'lossReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'lossReasons',

    labelAttribute: 'label',
    
    defaults: {
      label: null,
      position: 0
    },

    toJSON: function()
    {
      var lossReason = Model.prototype.toJSON.call(this);

      if (!lossReason.label)
      {
        lossReason.label = lossReason._id;
      }

      return lossReason;
    }

  });
});
