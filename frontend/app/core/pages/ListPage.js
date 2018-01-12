// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/ListView',
  './createPageBreadcrumbs'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'list',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this);
    },

    actions: function()
    {
      return [
        pageActions.add(this.collection, this.collection.getPrivilegePrefix() + ':MANAGE')
      ];
    },

    initialize: function()
    {
      this.collection = bindLoadingMessage(this.options.collection, this);
      this.view = this.createListView();
    },

    createListView: function()
    {
      var ListViewClass = this.ListView || this.options.ListView || ListView;

      return new ListViewClass({
        collection: this.collection,
        model: this.model,
        columns: this.options.columns || this.columns || ListViewClass.prototype.columns,
        serializeRow: this.options.serializeRow || this.serializeRow || ListViewClass.prototype.serializeRow,
        className: this.options.listClassName
          || this.listClassName
          || ListViewClass.prototype.className
          || 'is-clickable'
    });
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
