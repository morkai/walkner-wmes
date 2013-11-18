define([
  'underscore',
  'moment',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../EmptyOrderCollection',
  '../views/EmptyOrderPrintableListView',
  'i18n!app/nls/emptyOrders'
], function(
  _,
  moment,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  EmptyOrderCollection,
  EmptyOrderPrintableListView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'emptyOrderPrintableList',

    hdLeft: function()
    {
      var selector = _.find(this.collection.rqlQuery.selector.args, function(selector)
      {
        return selector.name === 'eq'
          && (selector.args[0] === 'startDate' || selector.args[0] === 'finishDate');
      });

      if (!selector)
      {
        return t('emptyOrders', 'PRINT_PAGE:HD:LEFT:all');
      }

      return t('emptyOrders', 'PRINT_PAGE:HD:LEFT:' + selector.args[0], {
        date: moment(selector.args[1]).format('LL')
      });
    },

    breadcrumbs: [
      t.bound('emptyOrders', 'BREADCRUMBS:browse')
    ],

    initialize: function()
    {
      this.collection = bindLoadingMessage(
        new EmptyOrderCollection(null, {rqlQuery: this.options.rql}), this
      );
      this.collection.rqlQuery.limit = -1;

      this.view = new EmptyOrderPrintableListView({collection: this.collection});
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
