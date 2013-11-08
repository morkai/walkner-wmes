define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../views/AorListView',
  'i18n!app/nls/aors'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  AorListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'aorList',

    breadcrumbs: [
      t.bound('aors', 'BREADCRUMBS:BROWSE')
    ],

    actions: function()
    {
      return [
        pageActions.add(this.model, 'AORS:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.aors, this);

      this.view = new AorListView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    }

  });
});
