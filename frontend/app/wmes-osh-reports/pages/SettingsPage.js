// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  '../views/SettingsView'
], function(
  View,
  dictionaries,
  SettingsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    nlsDomain: 'wmes-osh-reports',

    breadcrumbs: function()
    {
      return [
        this.t('breadcrumb'),
        this.t('settings:breadcrumb')
      ];
    },

    initialize: function()
    {
      this.view = new SettingsView({
        initialTab: this.options.initialTab,
        initialSubtab: this.options.initialSubtab,
        settings: dictionaries.settings
      });
    }

  });
});
