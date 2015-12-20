// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  'app/orders/templates/componentList'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    serialize: function()
    {
      return {
        bom: this.model.get('bom').toJSON()
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:bom', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:bom', this.render);
    }

  });
});
