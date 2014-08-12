// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../user',
  '../core/Model'
], function(
  user,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: {

    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.status = obj.completed ? 'completed' : 'waiting';

      obj.rowClassName = 'is-' + obj.status;

      if (obj.status === 'completed')
      {
        obj.schedule = [];
      }
      else if (user.isAllowedTo('PURCHASE_ORDERS:MANAGE'))
      {
        obj.rowClassName += ' is-selectable';
      }

      obj.rowSpan = obj.schedule.length;

      return obj;
    }

  });
});
