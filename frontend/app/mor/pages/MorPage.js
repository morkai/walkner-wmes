// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/mor/views/MorView'
], function(
  t,
  View,
  MorView
) {
  'use strict';

  return View.extend({

    pageId: 'mor',

    layoutName: 'page',

    title: t.bound('mor', 'BREADCRUMBS:base'),

    actions: function()
    {
      return [
        {
          label: t.bound('mor', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'MOR:MANAGE',
          href: '#mor;settings'
        }
      ];
    },

    initialize: function()
    {
      this.view = new MorView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
