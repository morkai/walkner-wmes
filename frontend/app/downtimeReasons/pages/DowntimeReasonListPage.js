define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../views/DowntimeReasonListView',
  'i18n!app/nls/downtimeReasons'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  DowntimeReasonListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'downtimeReasonList',

    breadcrumbs: [
      t.bound('downtimeReasons', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [pageActions.add(this.model, 'DICTIONARIES:MANAGE')];
    },

    initialize: function()
    {
      this.model = this.options.downtimeReasons;

      this.view = new DowntimeReasonListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
