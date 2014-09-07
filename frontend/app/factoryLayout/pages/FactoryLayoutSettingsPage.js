// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../views/FactoryLayoutSettingsView'
], function(
  t,
  View,
  FactoryLayoutSettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('factoryLayout', 'bc:layout'),
          href: '#factoryLayout'
        },
        t.bound('factoryLayout', 'bc:settings')
      ];
    },

    initialize: function()
    {
      this.defineViews();
    },

    destroy: function()
    {
      this.model.unload();
      this.model = null;
    },

    defineViews: function()
    {
      this.view = new FactoryLayoutSettingsView({
        initialTab: this.options.initialTab,
        settings: this.model.settings
      });
    },

    load: function(when)
    {
      return when(this.model.load(false));
    },

    afterRender: function()
    {
      this.model.load(false);
    }

  });
});
