define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../views/WorkCenterListView',
  'i18n!app/nls/workCenters'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  WorkCenterListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'workCenterList',

    breadcrumbs: [
      t.bound('workCenters', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [
        pageActions.add(this.model, 'DICTIONARIES:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.workCenters, this);

      this.view = new WorkCenterListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
