// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/KaizenOrderDetailsView',
  '../views/KaizenOrderHistoryView',
  'app/kaizenOrders/templates/detailsPage'
], function(
  $,
  t,
  user,
  viewport,
  DetailsPage,
  pageActions,
  kaizenDictionaries,
  KaizenOrderDetailsView,
  KaizenOrderHistoryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    baseBreadcrumb: true,
    breadcrumbs: function()
    {
      if (!this.options.standalone)
      {
        return DetailsPage.prototype.breadcrumbs.call(this);
      }

      return [
        t.bound('kaizenOrders', 'BREADCRUMB:base'),
        this.model.get('rid') + ''
      ];
    },

    localTopics: {
      'kaizen.orders.seen': 'onSeen'
    },

    actions: function()
    {
      var actions = [];

      if (user.isLoggedIn())
      {
        if (this.model.isNotSeen())
        {
          actions.push({
            id: 'markAsSeen',
            icon: 'eye',
            label: this.t('PAGE_ACTION:markAsSeen'),
            callback: this.markAsSeen.bind(this)
          });
        }

        var observer = this.model.get('observer');

        if (observer.role === 'subscriber')
        {
          actions.push({
            id: 'unobserve',
            icon: 'eye-slash',
            label: this.t('PAGE_ACTION:unobserve'),
            callback: this.unobserve.bind(this)
          });
        }
        else if (observer.role === 'viewer')
        {
          actions.push({
            id: 'observe',
            icon: 'eye',
            label: this.t('PAGE_ACTION:observe'),
            callback: this.observe.bind(this)
          });
        }

        if (this.model.canEdit())
        {
          actions.push(pageActions.edit(this.model, false));
        }

        if (this.model.canDelete())
        {
          actions.push(pageActions.delete(this.model, false));
        }
      }

      actions.push({
        label: this.t('core', 'PAGE_ACTION:add'),
        icon: 'plus',
        href: '#kaizenOrders;add'
      });

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('.kaizenOrders-detailsPage-properties', this.detailsView);
      this.setView('.kaizenOrders-detailsPage-history', this.historyView);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();

      $('body').removeClass('kaizenOrders-standalone');
    },

    defineViews: function()
    {
      this.detailsView = new KaizenOrderDetailsView({model: this.model});
      this.historyView = new KaizenOrderHistoryView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch(), kaizenDictionaries.load());
    },

    setUpLayout: function(layout)
    {
      this.listenTo(this.model, 'reset change', function()
      {
        layout.setActions(this.actions, this);
      });
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();

      $('body').toggleClass('kaizenOrders-standalone', !!this.options.standalone);
    },

    markAsSeen: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('kaizen.markAsSeen', {_id: this.model.id}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('kaizenOrders', 'MSG:markAsSeen:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    observe: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('kaizen.observe', {_id: this.model.id, state: true}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('kaizenOrders', 'MSG:observe:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    unobserve: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('kaizen.observe', {_id: this.model.id, state: false}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('kaizenOrders', 'MSG:unobserve:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    onSeen: function(orderId)
    {
      if (orderId === this.model.id)
      {
        this.model.markAsSeen();
      }
    }

  });
});
