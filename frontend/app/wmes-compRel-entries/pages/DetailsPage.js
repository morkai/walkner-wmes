// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/socket',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/core/util/pageActions',
  '../dictionaries',
  '../Entry',
  '../views/details/PropsView',
  '../views/details/FuncsView',
  '../views/details/ChatView',
  '../views/details/AttachmentsView',
  '../views/details/OrdersView',
  'app/wmes-compRel-entries/templates/details/page'
], function(
  _,
  $,
  user,
  socket,
  View,
  onModelDeleted,
  pageActions,
  dictionaries,
  Entry,
  PropsView,
  FuncsView,
  ChatView,
  AttachmentsView,
  OrdersView,
  template
) {
  'use strict';

  return View.extend({

    pageClassName: 'page-max-flex',

    template: template,

    remoteTopicsAfterSync: true,
    remoteTopics: function()
    {
      var topics = {
        'compRel.entries.deleted': 'onDeleted'
      };

      topics['compRel.entries.updated.' + this.model.id] = 'onUpdated';

      return topics;
    },

    breadcrumbs: function()
    {
      return [
        {
          href: this.model.genClientUrl('base'),
          label: this.t('BREADCRUMB:browse')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [];

      if (Entry.can.accept(page.model))
      {
        actions.push({
          icon: 'gavel',
          label: page.t('PAGE_ACTION:accept'),
          callback: function()
          {
            $('.btn', this).blur();

            var $func = page.funcsView.$('.compRel-details-func[data-status="pending"]').first();

            if ($func.length)
            {
              $func.find('.compRel-details-accept').click();
            }
            else
            {
              page.funcsView.$('.compRel-details-accept').first().click();
            }
          }
        });
      }

      if (Entry.can.releaseOrder(page.model))
      {
        actions.push({
          icon: 'plus',
          label: page.t('PAGE_ACTION:releaseOrder'),
          callback: function()
          {
            $('.btn', this).blur();
            page.ordersView.showReleaseOrderDialog();
          }
        });
      }

      actions.push(
        pageActions.edit(page.model),
        pageActions.delete(page.model)
      );

      return actions;
    },

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.defineViews();
      this.defineBindings();

      this.setView('#-props', this.propsView);
      this.setView('#-funcs', this.funcsView);
      this.setView('#-chat', this.chatView);
      this.setView('#-attachments', this.attachmentsView);
      this.setView('#-orders', this.ordersView);
    },

    defineViews: function()
    {
      this.propsView = new PropsView({model: this.model});
      this.funcsView = new FuncsView({model: this.model});
      this.chatView = new ChatView({model: this.model});
      this.attachmentsView = new AttachmentsView({model: this.model});
      this.ordersView = new OrdersView({model: this.model});
    },

    defineBindings: function()
    {
      var page = this;
      var entry = page.model;
      var idIsRid = parseInt(entry.id, 10) < 9999999;

      page.listenToOnce(entry, 'sync', function()
      {
        page.listenTo(entry, 'sync', page.render);
        page.listenTo(entry, 'change:status change:funcs', _.debounce(page.updateActions.bind(page), 1));

        if (idIsRid)
        {
          page.broker.publish('router.navigate', {
            url: entry.genClientUrl(),
            replace: true,
            trigger: false
          });
        }
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      View.prototype.afterRender.apply(this, arguments);
    },

    updateActions: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    },

    onDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    onUpdated: function(message)
    {
      if (!message.socketId || message.socketId !== socket.getId())
      {
        this.model.handleChange(message.change);
      }
    }

  });
});
