// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  '../views/OrderDocumentClientListView',
  '../views/OrderDocumentClientFilterView'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  FilteredListPage,
  OrderDocumentClientListView,
  OrderDocumentClientFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: OrderDocumentClientFilterView,
    ListView: OrderDocumentClientListView,

    breadcrumbs: function()
    {
      return [
        t.bound('orderDocumentClients', 'BREADCRUMB:base'),
        t.bound('orderDocumentClients', 'BREADCRUMB:browse')
      ];
    },

    actions: function()
    {
      return [{
        label: t.bound('orderDocumentClients', 'page:settings'),
        icon: 'cogs',
        privileges: 'DOCUMENTS:MANAGE',
        href: '#orders;settings?tab=documents'
      }];
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      this.$licensingMessage = null;
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      if (this.$licensingMessage !== null)
      {
        this.$licensingMessage.remove();
        this.$licensingMessage = null;
      }
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      this.checkLicensing();
    },

    checkLicensing: function()
    {
      var page = this;
      var req = this.ajax({
        method: 'GET',
        url: '/orderDocuments/licensing'
      });

      req.done(function(res)
      {
        page.showLicensingMessage(res.clientCount, res.licenseCount);
      });
    },

    showLicensingMessage: function(clientCount, licenseCount)
    {
      if (this.$licensingMessage !== null)
      {
        this.$licensingMessage.remove();
        this.$licensingMessage = null;
      }

      if (clientCount <= licenseCount)
      {
        return;
      }

      this.$licensingMessage = $('<a></a>')
        .attr('href', '#licenses?sort(expireDate)&limit(20)&appId=wmes-docs')
        .addClass('orderDocumentClients-licensingMessage message message-warning message-inline')
        .text(t('orderDocumentClients', 'licensingMessage', {clientCount: clientCount, licenseCount: licenseCount}))
        .prependTo(this.$el);
    }

  });
});
