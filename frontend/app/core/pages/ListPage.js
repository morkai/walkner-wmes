// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

      var ListViewClass = this.ListView || ListView;

      this.view = new ListViewClass({
        collection: this.collection,
        columns: this.options.columns || ListViewClass.prototype.columns,
        serializeRow: this.options.serializeRow || ListViewClass.prototype.serializeRow,
        className: this.options.listClassName || ListViewClass.prototype.className || 'is-clickable'
      });
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
