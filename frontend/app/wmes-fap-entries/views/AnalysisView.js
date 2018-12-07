// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/wmes-fap-entries/templates/analysis'
], function(
  _,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {



    },

    initialize: function()
    {

    },

    getTemplateData: function()
    {
      return {
        model: this.model.serializeDetails()
      };
    },

    afterRender: function()
    {

    }

  });
});
