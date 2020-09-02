// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/paintShop/PaintShopEventCollection',
  'app/paintShop/templates/orderDetails',
  'app/paintShop/templates/orderChanges',
  'app/paintShop/templates/orderChange',
  'app/paintShop/templates/queueOrder',
  'app/paintShop/templates/whOrders'
], function(
  _,
  $,
  t,
  viewport,
  user,
  View,
  PaintShopEventCollection,
  orderDetailsTemplate,
  orderChangesTemplate,
  orderChangeTemplate,
  queueOrderTemplate,
  whOrdersTemplate
) {
  'use strict';

  var ORDER_DOCUMENT_PREVIEW_ID = null;
  var ORDER_DOCUMENT_PREVIEW_WINDOW = null;

  return View.extend({

    template: orderDetailsTemplate,

    dialogClassName: 'paintShop-orderDetails-dialog',

    events: {
      'keydown .form-control': function(e)
      {
        if (e.key === 'Enter')
        {
          this.$(e.currentTarget).next().click();

          return false;
        }
      },
      'focus [data-vkb]': function(e)
      {
        if (!this.vkb)
        {
          return;
        }

        clearTimeout(this.timers.hideVkb);

        if (!this.vkb.show(e.currentTarget))
        {
          return;
        }

        this.vkb.$el.css({
          top: 'auto',
          bottom: '30px'
        });

        this.resizeChanges();
      },
      'blur [data-vkb]': 'scheduleHideVkb',
      'click .btn[data-action]': function(e)
      {
        this.handleAction(e.currentTarget.dataset);
      },
      'click a[data-action="openDocument"]': function(e)
      {
        var view = this;
        var aEl = e.currentTarget;

        if (aEl.dataset.checking === '1')
        {
          return false;
        }

        var id = aEl.textContent.trim();

        if (id === ORDER_DOCUMENT_PREVIEW_ID
          && ORDER_DOCUMENT_PREVIEW_WINDOW
          && !ORDER_DOCUMENT_PREVIEW_WINDOW.closed)
        {
          ORDER_DOCUMENT_PREVIEW_WINDOW.focus();

          return false;
        }

        if (aEl.dataset.checked !== '1')
        {
          view.tryOpenDocument(aEl);

          return false;
        }

        view.openDocumentWindow(aEl);

        return false;
      }
    },

    initialize: function()
    {
      this.vkb = this.options.vkb;
      this.psEvents = PaintShopEventCollection.forOrder(this.model.id);

      this.listenTo(this.orders, 'change', this.onChange);

      if (this.orders.whOrders)
      {
        this.listenTo(this.orders.whOrders, 'reset', this.onWhOrdersReset);
        this.listenTo(this.orders.whOrders, 'change', this.onWhOrdersChange);
      }

      if (this.vkb)
      {
        this.listenTo(this.vkb, 'keyFocused', this.onVkbFocused);
      }

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.vkb)
      {
        this.vkb.hide();
      }

      if (this.$changes)
      {
        this.$changes.remove();
        this.$changes = null;
      }
    },

    closeDialog: function() {},

    getTemplateData: function()
    {
      var order = this.model.serialize();

      return {
        order: order,
        fillerHeight: this.calcFillerHeight(),
        renderQueueOrder: queueOrderTemplate,
        renderWhOrders: whOrdersTemplate,
        canAct: this.canAct(),
        mrpDropped: this.dropZones.getState(order.mrp),
        getChildOrderDropZoneClass: this.orders.getChildOrderDropZoneClass.bind(this.orders)
      };
    },

    canAct: function()
    {
      var isEmbedded = this.options.embedded;
      var isLocal = user.isAllowedTo('LOCAL');
      var isLoggedIn = !!this.orders.user;
      var isPainter = user.isAllowedTo('PAINT_SHOP:PAINTER');
      var canManage = user.isAllowedTo('PAINT_SHOP:MANAGE');

      return (isEmbedded && isLocal && isLoggedIn) || isPainter || canManage;
    },

    beforeRender: function()
    {
      if (this.$changes)
      {
        this.$changes.remove();
        this.$changes = null;
      }
    },

    afterRender: function()
    {
      if (this.options.height === 0)
      {
        this.options.height = this.$('tbody')[0].clientHeight;

        this.resizeFiller();
      }

      this.renderChanges();
      this.reloadChanges();
      this.toggleActions();
    },

    renderChanges: function()
    {
      var view = this;
      var $changes = $(orderChangesTemplate({
        canAct: view.canAct()
      }));

      $changes.find('.paintShop-orderChanges-comment').on('focus', function()
      {
        if (view.options.vkb)
        {
          clearTimeout(view.timers.hideVkb);

          view.options.vkb.show(this);
          view.resizeChanges();
        }
      }).on('blur', function()
      {
        if (view.options.vkb)
        {
          view.scheduleHideVkb();
        }
      });

      $changes.find('.btn-primary').on('click', function()
      {
        view.handleAction({action: 'comment'});
      });

      $changes.appendTo(view.$el.parent());

      view.$changes = $changes;

      view.resizeChanges();
    },

    reloadChanges: function()
    {
      var view = this;

      view.promised(view.psEvents.fetch({reset: true})).done(function()
      {
        if (!view.$changes || !view.$changes.length)
        {
          return;
        }

        var html = view.psEvents.map(function(event)
        {
          return orderChangeTemplate({change: event.serialize()});
        });

        view.$changes
          .find('.paintShop-orderChanges-changes')
          .html(html)
          .prop('scrollTop', 99999);
      });
    },

    toggleActions: function()
    {
      var disabled = _.some(this.model.serialize().childOrders, function(childOrder)
      {
        return childOrder.drilling && childOrder.drilling !== 'finished';
      });

      this.$('.btn[data-action="start"]').prop('disabled', disabled);
    },

    scheduleHideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      this.timers.hideVkb = setTimeout(this.hideVkb.bind(this), 250);
    },

    hideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      if (this.vkb)
      {
        this.vkb.hide();
        this.resizeChanges();
      }
    },

    resizeChanges: function()
    {
      this.$changes
        .css('height', this.calcChangesHeight() + 'px')
        .find('.paintShop-orderChanges-changes')
        .prop('scrollTop', 99999);
    },

    resizeFiller: function()
    {
      this.$id('filler').css('height', this.calcFillerHeight() + 'px');
    },

    calcFillerHeight: function()
    {
      var height = window.innerHeight
        - 30 * 2 // Margins
        - 25
        - 75
        - this.options.height // PS order details
        - 24 // WH orders header
        - 25 * this.model.serialize().whOrders.length; // WH orders rows

      return Math.max(height, 0);
    },

    calcChangesHeight: function()
    {
      var vkbHeight = this.vkb ? this.vkb.$el.outerHeight() : 0;

      if (!vkbHeight)
      {
        vkbHeight = -30;
      }

      return Math.max(window.innerHeight - 2 - 30 * 2 - 30 - vkbHeight, 0);
    },

    handleAction: function(dataset)
    {
      var view = this;
      var action = dataset.action;
      var $comment = view.$changes.find('.paintShop-orderChanges-comment');
      var comment = $comment.val().trim();
      var data = {
        qtyDone: parseInt(view.$id('qtyDone').val(), 10),
        qtyDlv: parseInt(view.$id('qtyDlv').val(), 10),
        cabin: parseInt(dataset.cabin, 10) || undefined
      };

      if (action === 'start'
        && view.model.get('qtyDone') === 0
        && view.orders.settings.isMspOrder(view.model))
      {
        action = 'startMsp';
      }

      if (action === 'comment' && !comment)
      {
        viewport.closeDialog();

        return;
      }

      var $actions = view.$('.btn').prop('disabled', true);

      view.act(action, comment, data)
        .fail(function()
        {
          $actions.prop('disabled', false);
        })
        .done(function()
        {
          if (action === 'comment')
          {
            $comment.val('');
            $actions.prop('disabled', false);
          }
          else
          {
            view.closeDialog();
          }
        });
    },

    act: function(action, comment, data)
    {
      var reqData = _.assign({
        action: action,
        orderId: this.model.id,
        comment: comment
      }, data);

      return this.orders.act(reqData, function(err)
      {
        if (err)
        {
          return viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('paintShop', 'MSG:' + action + ':failure')
          });
        }
      });
    },

    onChange: function(order, options)
    {
      if (order !== this.model)
      {
        return;
      }

      var html = this.renderPartialHtml(queueOrderTemplate, {
        order: order.serialize(),
        visible: true,
        first: false,
        last: false,
        commentVisible: false,
        rowSpan: 'rowSpanDetails',
        mrpDropped: this.dropZones.getState(order.get('mrp')),
        getChildOrderDropZoneClass: this.orders.getChildOrderDropZoneClass.bind(this.orders),
        details: true
      });

      this.$('.paintShop-order').replaceWith(html);

      if (!options.drilling && !options.wh)
      {
        this.reloadChanges();
      }

      this.toggleActions();
    },

    onVkbFocused: function()
    {
      clearTimeout(this.timers.hideVkb);
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    onWindowResize: function()
    {
      this.resizeFiller();
      this.resizeChanges();
    },

    onWhOrdersReset: function()
    {
      this.renderWhOrders();
      this.resizeFiller();
    },

    onWhOrdersChange: function(whOrder)
    {
      if (whOrder.get('order') !== this.model.get('order'))
      {
        return;
      }

      this.renderWhOrders();
    },

    renderWhOrders: function()
    {
      var html = this.renderPartialHtml(whOrdersTemplate, {
        order: this.model.serialize()
      });

      this.$id('whOrders').html(html);
    },

    tryOpenDocument: function(aEl)
    {
      var view = this;

      viewport.msg.loading();

      aEl.dataset.checking = '1';

      view
        .ajax({method: 'HEAD', url: aEl.href})
        .done(function() { view.openDocumentWindow(aEl); })
        .always(function()
        {
          aEl.parentElement.textContent = aEl.textContent;
          aEl.dataset.checking = '0';
          aEl.dataset.checked = '1';

          viewport.msg.loaded();
        });
    },

    openDocumentWindow: function(aEl)
    {
      var view = this;
      var ready = false;
      var id = aEl.textContent.trim();
      var screen = window.screen;
      var availHeight = screen.availHeight;

      if (screen.availWidth === window.innerWidth && screen.availHeight !== window.innerHeight)
      {
        availHeight *= 0.9;
      }

      var width = screen.availWidth * 0.8;
      var height = availHeight * 0.9;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.floor((availHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);
      var windowName = 'WMES_ORDER_DOCUMENT_PREVIEW';
      var win = window.open(aEl.href, windowName, windowFeatures);

      if (!win)
      {
        return;
      }

      ORDER_DOCUMENT_PREVIEW_ID = id;
      ORDER_DOCUMENT_PREVIEW_WINDOW = win;

      clearInterval(view.timers[windowName]);

      view.timers[windowName] = setInterval(function()
      {
        if (win.closed)
        {
          ORDER_DOCUMENT_PREVIEW_ID = null;
          ORDER_DOCUMENT_PREVIEW_WINDOW = null;

          clearInterval(view.timers[windowName]);
        }
        else if (!ready && win.ready)
        {
          ready = true;

          win.focus();
        }
      }, 250);
    }

  });
});
