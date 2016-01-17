// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/changelog/templates/list'
], function(
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [t.bound('changelog', 'breadcrumbs:browse')];
    },

    initialize: function()
    {

    },

    afterRender: function()
    {

    }

  });
});
