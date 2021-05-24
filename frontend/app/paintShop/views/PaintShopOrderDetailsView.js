// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/core/util/uuid',
  'app/core/util/getShiftStartInfo',
  'app/core/util/resultTips',
  'app/paintShop/PaintShopEventCollection',
  'app/paintShop/templates/orderDetails',
  'app/paintShop/templates/orderActions',
  'app/paintShop/templates/orderChanges',
  'app/paintShop/templates/orderChange',
  'app/paintShop/templates/queueOrder',
  'app/paintShop/templates/whOrders',
  'app/paintShop/templates/workOrderEditor',
  'app/paintShop/templates/removeWorkOrderConfirmer'
], function(
  _,
  $,
  t,
  viewport,
  user,
  View,
  uuid,
  getShiftStartInfo,
  resultTips,
  PaintShopEventCollection,
  orderDetailsTemplate,
  orderActionsTemplate,
  orderChangesTemplate,
  orderChangeTemplate,
  queueOrderTemplate,
  whOrdersTemplate,
  workOrderEditorTemplate,
  removeWorkOrderConfirmerTemplate
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
        this.hideWorkOrderEditor();

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
      },
      'click .paintShop-order-childOrder': function(e)
      {
        if (this.$(e.target).closest('td[data-property="actions"]').length)
        {
          this.hideWorkOrderEditor();

          return;
        }

        if (this.canAct())
        {
          this.showWorkOrderEditor(+e.currentTarget.dataset.childOrderIndex);
        }
      },
      'click a[data-action="removeWorkOrder"]': function(e)
      {
        this.hideWorkOrderEditor();
        this.showRemoveWorkOrderConfirmer(this.$(e.currentTarget).closest('tr')[0].dataset.workOrderId);

        return false;
      }
    },

    initialize: function()
    {
      this.vkb = this.options.vkb;
      this.psEvents = PaintShopEventCollection.forOrder(this.model.id);
      this.disabledActions = false;

      this.listenTo(this.psEvents, 'add', this.onEventAdded);
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

      this.hideWorkOrderEditor();
    },

    closeDialog: function() {},

    getTemplateData: function()
    {
      var order = this.model.serialize();

      return {
        order: order,
        fillerHeight: this.calcFillerHeight(),
        renderOrderActions: this.renderPartialHtml.bind(this, orderActionsTemplate),
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
      var $changes = this.renderPartial(orderChangesTemplate, {
        canAct: view.canAct()
      });

      $changes.find('.paintShop-orderChanges-comment').on('focus', function()
      {
        if (view.options.vkb)
        {
          clearTimeout(view.timers.hideVkb);

          view.hideWorkOrderEditor();
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

        var html = view.psEvents
          .map(function(event)
          {
            return view.renderPartialHtml(orderChangeTemplate, {
              change: event.serialize()
            });
          })
          .join('');

        view.$changes
          .find('.paintShop-orderChanges-changes')
          .html(html)
          .prop('scrollTop', 99999);
      });
    },

    onEventAdded: function(event)
    {
      var view = this;

      if (!view.$changes || !view.$changes.length)
      {
        return;
      }

      view.$changes
        .find('.paintShop-orderChanges-changes')
        .append(view.renderPartialHtml(orderChangeTemplate, {
          change: event.serialize()
        }))
        .prop('scrollTop', 99999);
    },

    toggleActions: function()
    {
      this.$id('actions').find('.btn').prop('disabled', this.disabledActions);

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

      this.positionWorkOrderEditor();
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
        - 25 * this.model.serialize().whOrders.length
        - 19 * this.model.get('workOrders').length;

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

      var autoWorkOrders = false;

      if (action === 'finish' && (!data.qtyDone || data.qtyDone >= this.model.get('qty')))
      {
        var oldCount = this.model.get('workOrders').length;

        data.workOrders = this.completeWorkOrders();

        autoWorkOrders = data.workOrders.length > oldCount;
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
          else if (autoWorkOrders)
          {
            view.showAutoWorkOrdersMessage();
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

    onChange: function(order)
    {
      if (order !== this.model)
      {
        return;
      }

      var orderData = order.serialize();
      var $order = this.$('.paintShop-order');
      var oldStatus = $order[0].dataset.status;
      var newStatus = orderData.status;
      var html = this.renderPartialHtml(queueOrderTemplate, {
        order: orderData,
        visible: true,
        first: false,
        last: false,
        commentVisible: false,
        canAct: this.canAct(),
        rowSpan: 'rowSpanDetails',
        mrpDropped: this.dropZones.getState(order.get('mrp')),
        getChildOrderDropZoneClass: this.orders.getChildOrderDropZoneClass.bind(this.orders),
        details: true
      });

      this.$('.paintShop-order').replaceWith(html);

      if (newStatus !== oldStatus)
      {
        this.$id('actions').html(this.renderPartialHtml(orderActionsTemplate, {
          order: orderData
        }));
      }

      this.toggleActions();

      viewport.adjustDialogBackdrop();
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
    },

    showWorkOrderEditor: function(childOrderI)
    {
      var view = this;
      var childOrder = view.model.get('childOrders')[childOrderI];

      if (!childOrder)
      {
        return;
      }

      view.hideVkb();

      var $editor = view.$id('workOrderEditor');

      if (!$editor.length)
      {
        var shifts = [
          null,
          {no: 1, value: 0, current: false},
          {no: 2, value: 0, current: false},
          {no: 3, value: 0, current: false}
        ];
        var currShift = getShiftStartInfo(Date.now());
        var prevShift = getShiftStartInfo(currShift.startTime - 4 * 3600 * 1000);

        shifts[currShift.no].current = true;
        shifts[currShift.no].value = currShift.moment.utc(true).valueOf();
        shifts[prevShift.no].value = prevShift.moment.utc(true).valueOf();

        $editor = view.renderPartial(workOrderEditorTemplate, {
          shifts: shifts,
          currentShift: currShift.no
        });

        $editor.on('submit', view.submitWorkOrderEditor.bind(view));

        $editor.find('#' + view.idPrefix + '-woe-cancel').on('click', view.hideWorkOrderEditor.bind(view));

        if (view.vkb)
        {
          $editor.find('input[data-vkb]')
            .on('blur', view.scheduleHideVkb.bind(view))
            .on('focus', view.showWorkOrderEditorVkb.bind(view));
        }

        $editor.appendTo(document.body);
      }

      $editor.data('childOrderI', childOrderI);
      $editor.css({
        top: '0',
        left: '-1000px'
      });

      var $qtyDone = $editor.find('input[name="qtyDone"]').val(view.calcWorkOrderQuantity(childOrder));

      $editor.removeClass('hidden');

      view.positionWorkOrderEditor();

      $qtyDone.focus();
    },

    calcWorkOrderQuantity: function(childOrder)
    {
      var quantities = [];

      for (var i = 0; i < childOrder.paintCount; ++i)
      {
        quantities.push(childOrder.qty);
      }

      this.model.get('workOrders').forEach(function(o)
      {
        if (o.childOrder !== childOrder.order)
        {
          return;
        }

        var qtyDone = o.qtyDone;

        while (quantities.length)
        {
          quantities[0] -= qtyDone;

          if (quantities[0] === 0)
          {
            quantities.shift();

            break;
          }

          if (quantities[0] < 0)
          {
            qtyDone = quantities[0] * -1;

            quantities.shift();

            continue;
          }

          break;
        }
      });

      return quantities.length ? quantities[0] : 0;
    },

    positionWorkOrderEditor: function()
    {
      var view = this;
      var $editor = view.$id('workOrderEditor');
      var childOrderI = $editor.data('childOrderI');
      var $childOrder = view.$('.paintShop-order-childOrder[data-child-order-index="' + childOrderI + '"]').first();

      if (!$childOrder.length)
      {
        return;
      }

      var $order = $childOrder.find('.paintShop-property[data-property="order"]');
      var rect = $order[0].getBoundingClientRect();
      var top = rect.top + 24;
      var editorHeight = $editor.outerHeight() + 15;

      if (top + editorHeight > window.innerHeight)
      {
        top -= (top + editorHeight) - window.innerHeight;
      }

      $editor.css({
        top: top + 'px',
        left: (rect.left + 5) + 'px'
      });
    },

    hideWorkOrderEditor: function()
    {
      this.$id('workOrderEditor').remove();
      this.$id('removeWorkOrderConfirmer').remove();
    },

    showWorkOrderEditorVkb: function(e)
    {
      var view = this;

      clearTimeout(view.timers.hideVkb);

      view.vkb.show(e.currentTarget);

      var $editor = view.$id('workOrderEditor');
      var editorRect = $editor[0].getBoundingClientRect();
      var inputRect = e.currentTarget.getBoundingClientRect();
      var top = inputRect.top;
      var vkbHeight = view.vkb.$el.outerHeight() + 15;

      if (top + vkbHeight > window.innerHeight)
      {
        top -= (top + vkbHeight) - window.innerHeight;
      }

      view.vkb.$el.css({
        top: top + 'px',
        left: (editorRect.left + editorRect.width + 15) + 'px'
      });
    },

    submitWorkOrderEditor: function(e)
    {
      e.preventDefault();

      var view = this;
      var $editor = view.$id('workOrderEditor');
      var childOrder = view.model.get('childOrders')[$editor.data('childOrderI')];

      view.hideVkb();

      if (!childOrder)
      {
        return view.hideWorkOrderEditor();
      }

      var creator = user.getInfo();
      var workOrder = {
        _id: uuid(),
        createdAt: new Date(),
        creator: creator,
        childOrder: childOrder.order,
        qtyDone: parseInt($editor.find('input[name="qtyDone"]').val(), 10) || 0,
        shift: new Date(+$editor.find('input[name="shift"]:checked').val()),
        workers: [view.orders.user || creator]
      };

      if (workOrder.qtyDone <= 0)
      {
        return view.hideWorkOrderEditor();
      }

      var $actions = view.$('.form-actions .btn').prop('disabled', true);

      view.act('addWorkOrder', '', {workOrder: workOrder})
        .fail(function()
        {
          $actions.prop('disabled', false);
        })
        .done(function()
        {
          view.hideWorkOrderEditor();
        });
    },

    showRemoveWorkOrderConfirmer: function(workOrderId)
    {
      var $confirmer = this.renderPartial(removeWorkOrderConfirmerTemplate);

      $confirmer.find('.btn-danger').on('click', this.removeWorkOrder.bind(this, workOrderId));

      $confirmer.find('.btn-default').on('click', this.hideWorkOrderEditor.bind(this));

      var $workOrder = this.$('.is-workOrder[data-work-order-id="' + workOrderId + '"]');
      var $action = $workOrder.find('a[data-action="removeWorkOrder"]');
      var rect = $action[0].getBoundingClientRect();

      $confirmer.css({
        top: rect.top + 'px',
        left: rect.left + 'px'
      });

      $confirmer.appendTo(document.body);
    },

    removeWorkOrder: function(workOrderId)
    {
      var view = this;
      var workOrder = view.model.get('workOrders').find(function(o) { return o._id === workOrderId; });

      if (!workOrder)
      {
        return view.hideWorkOrderEditor();
      }

      var $actions = view.$id('removeWorkOrderConfirmer').find('.btn').prop('disabled', true);

      view.act('removeWorkOrder', '', {workOrder: workOrder})
        .fail(function()
        {
          $actions.prop('disabled', false);
        })
        .done(function()
        {
          view.hideWorkOrderEditor();
        });
    },

    completeWorkOrders: function()
    {
      var childOrders = this.model.get('childOrders');
      var workOrders = this.model.get('workOrders');
      var completeWorkOrders = {};
      var creator = user.getInfo();
      var workers = [this.orders.user || creator];
      var createdAt = new Date();
      var shift = getShiftStartInfo(createdAt).moment.toDate();

      childOrders.forEach(function(childOrder)
      {
        completeWorkOrders[childOrder.order] = [];

        childOrder.paintList.forEach(function()
        {
          completeWorkOrders[childOrder.order].push({
            _id: uuid(),
            createdAt: createdAt,
            creator: creator,
            childOrder: childOrder.order,
            qtyDone: childOrder.qty,
            shift: shift,
            workers: workers
          });
        });
      });

      workOrders.forEach(function(workOrder)
      {
        var complete = completeWorkOrders[workOrder.childOrder];

        if (!complete)
        {
          return;
        }

        var qtyRemaining = workOrder.qtyDone;

        while (qtyRemaining && complete.length)
        {
          var completeWorkOrder = complete[0];

          if (qtyRemaining === completeWorkOrder.qtyDone)
          {
            qtyRemaining = 0;
            complete.shift();
          }
          else if (qtyRemaining < completeWorkOrder.qtyDone)
          {
            completeWorkOrder.qtyDone -= qtyRemaining;
            qtyRemaining = 0;
          }
          else
          {
            qtyRemaining -= completeWorkOrder.qtyDone;
            complete.shift();
          }
        }
      });

      var newWorkOrders = [].concat(workOrders);

      _.forEach(completeWorkOrders, function(workOrders)
      {
        workOrders.forEach(function(workOrder)
        {
          newWorkOrders.push(workOrder);
        });
      });

      return newWorkOrders;
    },

    showAutoWorkOrdersMessage: function()
    {
      var view = this;

      view.disabledActions = true;
      view.toggleActions();

      var btn = view.$('.paintShop-orderDetails-actions').children().first()[0];

      resultTips.show({
        el: btn,
        type: 'info',
        time: 1500,
        text: this.t('autoWorkOrders'),
        offsetTop: -30,
        className: 'paintShop-orderDetails-resultTip'
      });

      view.timers.enableActions = setTimeout(function()
      {
        view.disabledActions = false;
        view.toggleActions();
      }, 1500);
    }

  });
});
