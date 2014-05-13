// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  'app/orders/templates/operationList'
], function(
  View,
  operationListTemplate
) {
  'use strict';

  function formatNumericProperty(obj, prop)
  {
    if (obj[prop] && obj[prop].toLocaleString)
    {
      obj[prop] = obj[prop].toLocaleString();
    }
  }

  return View.extend({

    template: operationListTemplate,

    serialize: function()
    {
      return {
        operations: this.model.get('operations')
          .toJSON()
          .map(function(op)
          {
            formatNumericProperty(op, 'machineSetupTime');
            formatNumericProperty(op, 'laborSetupTime');
            formatNumericProperty(op, 'machineTime');
            formatNumericProperty(op, 'laborTime');

            return op;
          })
          .sort(function(a, b) { return a.no - b.no; }),
        highlighted: this.options.highlighted
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
