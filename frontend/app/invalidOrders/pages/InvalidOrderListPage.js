// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/views/ActionFormView',
  'app/users/ownMrps',
  '../views/InvalidOrderFilterView',
  '../views/InvalidOrderListView'
], function(
  _,
  t,
  user,
  FilteredListPage,
  ActionFormView,
  ownMrps,
  InvalidOrderFilterView,
  InvalidOrderListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: InvalidOrderFilterView,
    ListView: InvalidOrderListView,

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('invalidOrders', 'PAGE_ACTION:check'),
        icon: 'question',
        privileges: 'ORDERS:MANAGE',
        callback: page.showCheckDialog.bind(page)
      }, {
        id: '-notify',
        icon: 'envelope-o',
        label: t('invalidOrders', 'PAGE_ACTION:notify'),
        className: function()
        {
          return _.isEmpty(page.collection.selected) ? 'disabled' : '';
        },
        callback: page.showNotifyDialog.bind(page)
      }, {
        label: t.bound('invalidOrders', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'ORDERS:MANAGE',
        href: '#orders;settings?tab=iptChecker'
      }];
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      this.listenTo(this.collection, 'selected', this.onSelected);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}), ownMrps.load(this));
    },

    createFilterView: function()
    {
      return new InvalidOrderFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        }
      });
    },

    showCheckDialog: function()
    {
      ActionFormView.showDialog({
        model: this.collection,
        formAction: '/invalidOrders;checkOrders',
        actionKey: 'check',
        formMethod: 'POST',
        formActionSeverity: 'primary'
      });
    },

    showNotifyDialog: function()
    {
      var orders = _.keys(this.collection.selected);

      if (!orders.length)
      {
        return;
      }

      var dialogView = ActionFormView.showDialog({
        model: this.collection,
        formAction: '/invalidOrders;notifyUsers',
        actionKey: 'notify',
        formMethod: 'POST',
        formActionSeverity: 'primary',
        messageText: t('invalidOrders', 'ACTION_FORM:MESSAGE_SPECIFIC:notify', {orders: orders.join(', ')}),
        requestData: {orders: orders}
      });

      this.listenTo(dialogView, 'success', function()
      {
        this.collection.toggleSelection(null, false);
      });
    },

    onSelected: function()
    {
      this.$id('notify').toggleClass('disabled', _.isEmpty(this.collection.selected));
    }

  });
});
