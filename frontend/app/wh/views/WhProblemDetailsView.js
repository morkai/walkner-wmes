// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wh/templates/problemDetails'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    events: {

    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.model, 'remove', view.onOrderRemoved);
      view.listenTo(view.model, 'change', view.onOrderChanged);
    },

    getTemplateData: function()
    {
      return {

      };
    },

    afterRender: function()
    {

    },

    onOrderRemoved: function()
    {

    },

    onOrderChanged: function()
    {

    }

  });
});
