// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  'app/xiconf/XiconfSettingCollection',
  '../views/XiconfClientListView',
  '../views/XiconfClientFilterView'
], function(
  t,
  bindLoadingMessage,
  FilteredListPage,
  XiconfSettingCollection,
  XiconfClientListView,
  XiconfClientFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: XiconfClientFilterView,
    ListView: XiconfClientListView,

    breadcrumbs: function()
    {
      return [
        t.bound('xiconfClients', 'BREADCRUMBS:base'),
        t.bound('xiconfClients', 'BREADCRUMBS:browse')
      ];
    },

    actions: function()
    {
      return [];
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
      this.settings = bindLoadingMessage(new XiconfSettingCollection(null, {pubsub: this.pubsub}), this);
    },

    createListView: function()
    {
      return new XiconfClientListView({
        collection: this.collection,
        settings: this.settings
      });
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.settings.fetch({reset: true})
      );
    }

  });
});
