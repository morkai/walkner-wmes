// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  var STATUS_TO_CLASS = {
    completed: 'success',
    delivered: 'info',
    delivering: 'warning',
    waiting: ''
  };

  return Model.extend({

    defaults: {

    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.status = obj.completed
        ? 'completed'
        : obj.delivered
          ? 'delivered'
        : obj.deliveredQty > 0
          ? 'delivering'
        : 'waiting';

      obj.rowClassName = STATUS_TO_CLASS[obj.status];

      return obj;
    }

  });
});
