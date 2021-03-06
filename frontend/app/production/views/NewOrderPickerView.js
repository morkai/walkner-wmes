// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orders/util/resolveProductName',
  '../util/orderPickerHelpers',
  '../util/limitQuantityDone',
  'app/production/templates/newOrderPicker'
], function(
  _,
  $,
  t,
  viewport,
  View,
  resolveProductName,
  orderPickerHelpers,
  limitQuantityDone,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: function()
    {
      var className = 'production-modal production-newOrderPickerDialog';

      if (this.options.correctingOrder)
      {
        className += ' is-correcting';
      }
      else if (this.model.hasOrder())
      {
        className += ' is-replacing';
      }

      return className;
    },

    localTopics: {
      'socket.connected': 'render',
      'socket.disconnected': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['production.spigotCheck.scanned.' + this.model.prodLine.id] = 'onSpigotScanned';

      return topics;
    },

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'focus #-spigot-nc12': function()
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.hide();
        }
      },
      'click .btn[data-operation]': function(e)
      {
        if (e.currentTarget.classList.contains('active'))
        {
          return;
        }

        this.$('.active[data-operation]').removeClass('active');
        e.currentTarget.classList.add('active');

        this.updateNewWorkerCount();
      },
      'input #-order': function(e)
      {
        if (this.options.embedded)
        {
          this.onVkbValueChange(e.target);
        }
      },
      'input input[type="text"][max]': 'checkMinMaxValidity',
      'blur input[type="text"][max]': 'checkMinMaxValidity',
      'keypress .select2-container': function(e)
      {
        if (e.which === 13)
        {
          this.$el.submit();

          return false;
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$id('submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var $nc12 = this.$id('spigot-nc12');

        if ($nc12.length)
        {
          var matches = $nc12.val().match(/([0-9]{12})/);
          var nc12 = matches ? matches[1] : '';

          if (!nc12.length || !this.model.checkSpigot(null, nc12))
          {
            $nc12[0].setCustomValidity(this.t('newOrderPicker:spigot:invalid'));

            this.timers.submit = setTimeout(
              function()
              {
                submitEl.disabled = false;
                submitEl.click();
              },
              1,
              this
            );

            return;
          }
        }

        if (this.ft && this.ft.checkCredentials)
        {
          return this.ft.checkCredentials();
        }

        if (this.socket.isConnected())
        {
          if (this.options.embedded)
          {
            this.handleEmbeddedPick(submitEl);
          }
          else
          {
            this.handleOnlinePick(submitEl);
          }
        }
        else
        {
          this.handleOfflinePick(submitEl);
        }
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.lastKeyPressAt = 0;
      this.lastPhrase = '';
      this.lastOrders = [];
      this.searchReq = null;

      if (this.options.correctingOrder)
      {
        this.lastOrders.push(this.model.prodShiftOrder.get('orderData'));
      }

      this.listenTo(this.model.prodShiftOrder, 'qtyMaxChanged', this.limitQuantityDone);

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keypress.' + this.idPrefix, this.onKeyPress.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }

      if (this.$id('spigot-nc12').length)
      {
        this.pubsub.publish('production.spigotCheck.aborted.' + this.model.prodLine.id, {
          prodLineId: this.model.prodLine.id
        });
      }
    },

    getTemplateData: function()
    {
      var shift = this.model;
      var order = shift.prodShiftOrder;
      var orderIdType = shift.getOrderIdType();
      var replacingOrder = !this.options.correctingOrder && shift.hasOrder();
      var correctingOrder = !!this.options.correctingOrder;
      var submitLabel = replacingOrder ? ':replacing' : correctingOrder ? ':correcting' : '';

      return {
        embedded: this.options.embedded,
        spigot: shift.settings.getValue('spigotFinish') && !!order.get('spigot'),
        offline: !this.socket.isConnected(),
        replacingOrder: replacingOrder,
        correctingOrder: correctingOrder,
        quantityDone: order.get('quantityDone') || 0,
        workerCount: order.getWorkerCountForEdit(),
        orderIdType: orderIdType,
        maxQuantityDone: order.getMaxQuantityDone(),
        maxWorkerCount: order.getMaxWorkerCount(),
        orderPlaceholder: this.options.embedded
          ? (orderIdType === 'no' ? '000000000' : '000000000000')
          : this.t('newOrderPicker:order:placeholder:' + orderIdType),
        orderMaxLength: orderIdType === 'no' ? 9 : 12,
        operationPlaceholder: this.options.embedded
          ? '0000'
          : this.t('newOrderPicker:operation:placeholder'),
        submitLabel: this.t('newOrderPicker:submit' + submitLabel)
      };
    },

    afterRender: function()
    {
      if (this.socket.isConnected())
      {
        this.setUpOrderSelect2();
        this.setUpOperationSelect2();

        if (this.options.correctingOrder)
        {
          this.selectCurrentOrder();
        }
        else if (this.options.order)
        {
          this.selectSpecifiedOrder();
          this.limitQuantityDone();
        }
        else
        {
          this.selectNextOrder();
          this.limitQuantityDone();
        }
      }
      else if (this.options.correctingOrder)
      {
        this.$id('order').val(this.model.prodShiftOrder.get('orderId'));
        this.$id('operation').val(this.model.prodShiftOrder.get('operationNo'));
      }

      this.notifySpigotCheckRequest();

      /*
      if (this.model.isTaktTimeEnabled())
      {
        this.$id('quantityDone').prop('disabled', true);
      }
      */
    },

    notifySpigotCheckRequest: function()
    {
      if (!this.$id('spigot-nc12').length)
      {
        return;
      }

      clearTimeout(this.timers.notifySpigotCheckRequest);
      this.timers.notifySpigotCheckRequest = setTimeout(this.notifySpigotCheckRequest.bind(this), 5000);

      this.pubsub.publish('production.spigotCheck.requested.' + this.model.prodLine.id, {
        prodLine: this.model.prodLine.id,
        component: this.model.prodShiftOrder.get('spigot').component,
        orderNo: this.model.prodShiftOrder.get('orderId'),
        source: 'newOrder'
      });
    },

    onSpigotScanned: function(message)
    {
      var $spigot = this.$id('spigot-nc12').val(message.nc12);

      if (!$spigot.length)
      {
        return;
      }

      $spigot[0].setCustomValidity('');

      var prodLineId = this.model.prodLine.id;
      var pso = this.model.prodShiftOrder;
      var spigot = pso.get('spigot');

      if (!spigot)
      {
        return;
      }

      if (this.model.checkSpigotValidity(message.nc12, spigot.component.nc12))
      {
        this.pubsub.publish('production.spigotCheck.success.' + prodLineId, {
          prodLine: prodLineId,
          component: spigot.component,
          orderNo: pso.get('orderId'),
          input: message.nc12,
          nc12: spigot.component.nc12,
          source: 'newOrder'
        });
      }
      else
      {
        this.pubsub.publish('production.spigotCheck.failure.' + prodLineId, {
          prodLine: prodLineId,
          component: spigot.component,
          orderNo: pso.get('orderId'),
          input: message.nc12,
          source: 'newOrder'
        });
      }
    },

    limitQuantityDone: function()
    {
      limitQuantityDone(this, this.model.prodShiftOrder);
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.focusFirstInput();
    },

    closeDialog: function() {},

    focusFirstInput: function()
    {
      if (this.$id('spigot-nc12').length)
      {
        this.$id('spigot-nc12').focus();
      }
      else if (!this.options.embedded && this.socket.isConnected())
      {
        this.$id('order').select2('focus');
      }
      else
      {
        this.$id('order').select();
      }
    },

    setUpOrderSelect2: function()
    {
      if (!this.options.embedded)
      {
        return orderPickerHelpers.setUpOrderSelect2(
          this.$id('order'),
          this.$id('operation'),
          this.model,
          {dropdownCssClass: 'production-dropdown'}
        );
      }
    },

    setUpOperationSelect2: function()
    {
      if (!this.options.embedded)
      {
        return orderPickerHelpers.setUpOperationSelect2(
          this.$id('operation'),
          [],
          {dropdownCssClass: 'production-dropdown'}
        );
      }
    },

    selectCurrentOrder: function()
    {
      if (this.options.embedded)
      {
        var pso = this.model.prodShiftOrder;

        this.$id('order').val(pso.get('orderId'));
        this.$id('operationGroup').find('div').html(
          this.buildOrderOperationList(pso.get('orderData'), pso.get('operationNo'))
        );

        viewport.adjustDialogBackdrop();
      }
      else
      {
        orderPickerHelpers.selectOrder(this.$id('order'), this.model.prodShiftOrder);
      }
    },

    selectNextOrder: function()
    {
      var nextOrders = this.model.get('nextOrder');

      if (_.isEmpty(nextOrders))
      {
        return;
      }

      var next = nextOrders[0];
      var order = next.order;

      if (!order || !order.no)
      {
        if (window.WMES_LOG_BROWSER_ERROR)
        {
          window.WMES_LOG_BROWSER_ERROR( // eslint-disable-line new-cap
            'Invalid nextOrder!?! ' + JSON.stringify(nextOrders)
          );
        }

        return;
      }

      var $order = this.$id('order');

      if (this.options.embedded)
      {
        this.lastOrders = [order];

        $order.val(order.no || order.nc12);

        this.$id('operationGroup').find('div').html(
          this.buildOrderOperationList(order, next.operationNo)
        );

        this.updateNewWorkerCount(next.workerCount);

        viewport.adjustDialogBackdrop();

        return;
      }

      $order.select2('data', _.assign({}, order, {
        id: order.no,
        text: order.no + ' - ' + (resolveProductName(order) || '?'),
        sameOrder: false
      }));

      $order.trigger({
        type: 'change',
        operations: _.values(order.operations),
        selectedOperationNo: next.operationNo
      });
    },

    selectSpecifiedOrder: function()
    {
      var view = this;
      var input = view.options.order;

      if (!input)
      {
        return;
      }

      view.$id('order').val(input.orderId);

      this.handleOrderChange(function()
      {
        view.$id('operationGroup').find('[data-operation="' + input.operationNo + '"]').click();
        view.$id('newWorkerCount').val(input.workerCount.toLocaleString());
      });
    },

    handleEmbeddedPick: function(submitEl)
    {
      var orderNo = this.$id('order').val();
      var order = this.lastOrders[0];

      if (!orderNo || !order || orderNo !== (order._id || order.no))
      {
        this.$id('order').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t('newOrderPicker:msg:emptyOrder')
        });
      }

      var operationNo = this.$id('operationGroup').find('.active').first().attr('data-operation') || '0000';
      var orderInfo = _.clone(order);

      orderPickerHelpers.prepareOrderInfo(this.model, orderInfo);

      this.pickOrder(orderInfo, operationNo);
    },

    handleOnlinePick: function(submitEl)
    {
      var orderInfo = this.$id('order').select2('data');
      var $operation = this.$id('operation');
      var operationNo = $operation.hasClass('form-control') ? $operation.val() : this.$id('operation').select2('val');

      if (!orderInfo)
      {
        this.$id('order').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t('newOrderPicker:msg:emptyOrder')
        });
      }

      if (!operationNo)
      {
        $operation.focus();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t('newOrderPicker:msg:emptyOperation')
        });
      }

      if (orderInfo.sameOrder)
      {
        orderInfo = this.model.prodShiftOrder.get('orderData');
      }
      else
      {
        orderPickerHelpers.prepareOrderInfo(this.model, orderInfo);
      }

      this.pickOrder(orderInfo, operationNo);
    },

    handleOfflinePick: function(submitEl)
    {
      var orderIdType = this.model.getOrderIdType();
      var orderInfo = {
        no: null,
        nc12: null
      };

      var orderNoOrNc12 = this.$id('order').val().trim().replace(/[^a-zA-Z0-9]+/g, '');
      var operationNo = this.$id('operation').val().trim().replace(/[^0-9]+/g, '');

      if (orderIdType === 'no' && /^[0-9]{9,}$/.test(orderNoOrNc12))
      {
        orderInfo.no = orderNoOrNc12;
      }
      else if (orderIdType === 'nc12'
        && (orderNoOrNc12.length === 12
        || (orderNoOrNc12.length < 9 && /^[a-zA-Z]+[a-zA-Z0-9]*$/.test(orderNoOrNc12))))
      {
        orderInfo.nc12 = orderNoOrNc12;
      }
      else
      {
        this.$id('order').select();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t(
            orderNoOrNc12 === ''
              ? 'newOrderPicker:msg:emptyOrder'
              : ('newOrderPicker:msg:invalidOrderId:' + orderIdType)
          )
        });
      }

      if (!/^[0-9]{1,4}$/.test(operationNo))
      {
        this.$id('operation').select();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: this.t(
            orderNoOrNc12 === ''
              ? 'newOrderPicker:msg:emptyOrder'
              : 'newOrderPicker:msg:invalidOperationNo'
          )
        });
      }

      this.pickOrder(orderInfo, operationNo);
    },

    pickOrder: function(orderInfo, operationNo)
    {
      while (operationNo.length < 4)
      {
        operationNo = '0' + operationNo;
      }

      var statuses = orderInfo.statuses;

      if (Array.isArray(statuses) && statuses.length && window.ENV !== 'development')
      {
        if (_.intersection(statuses, ['TECO', 'DLT', 'DLFL']).length)
        {
          this.$id('order').select();
          this.$id('submit').prop('disabled', false);

          return viewport.msg.show({
            type: 'error',
            time: 2000,
            text: this.t('newOrderPicker:msg:orderDeleted')
          });
        }

        var qtyDone = orderInfo.qtyDone
          && orderInfo.qtyDone.byOperation
          && orderInfo.qtyDone.byOperation[operationNo]
          || 0;
        var qtyMax = orderInfo.qtyMax
          && orderInfo.qtyMax[operationNo]
          || orderInfo.qty;

        if (qtyMax && qtyDone >= qtyMax && _.intersection(statuses, ['CNF', 'DLV']).length)
        {
          this.$id('order').select();
          this.$id('submit').prop('disabled', false);

          return viewport.msg.show({
            type: 'error',
            time: 2000,
            text: this.t('newOrderPicker:msg:orderCompleted')
          });
        }
      }

      if (!this.options.correctingOrder && this.model.hasOrder())
      {
        this.model.changeQuantityDone(this.parseInt('quantityDone'));
        this.model.changeWorkerCount(this.parseFloat('workerCount'));
      }

      if (this.options.correctingOrder)
      {
        this.model.correctOrder(orderInfo, operationNo);
      }
      else
      {
        this.model.changeOrder(orderInfo, operationNo, this.parseFloat('newWorkerCount'));
      }

      this.closeDialog();
    },

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    },

    parseFloat: function(field)
    {
      var value = Math.round(parseFloat(this.$id(field).val().replace(',', '.')) * 10) / 10;

      return isNaN(value) || value < 0 ? 0 : value;
    },

    isIgnoredTarget: function(target)
    {
      return target.type === 'number'
        || target.className.indexOf('select2') !== -1
        || target.dataset.ignoreKey === '1';
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 8 && !this.isIgnoredTarget(e.target))
      {
        this.lastKeyPressAt = Date.now();

        var $nc12 = this.$id('spigot-nc12');

        if ($nc12.length)
        {
          $nc12.val('')[0].setCustomValidity('');
        }

        return false;
      }
    },

    onKeyPress: function(e)
    {
      var $nc12 = this.$id('spigot-nc12');

      if (!$nc12.length)
      {
        return;
      }

      var target = e.target;
      var keyCode = e.keyCode;

      if (keyCode === 13)
      {
        return $nc12[0] !== target;
      }

      if (keyCode < 32 || keyCode > 126 || this.isIgnoredTarget(target))
      {
        return;
      }

      var keyPressAt = Date.now();
      var prevValue = keyPressAt - this.lastKeyPressAt > 333 ? '' : $nc12.val();
      var key = String.fromCharCode(keyCode);

      $nc12.val(prevValue + key)[0].setCustomValidity('');
      $nc12.focus();

      this.lastKeyPressAt = keyPressAt;

      return false;
    },

    onVkbValueChange: function(fieldEl)
    {
      if (this.socket.isConnected() && fieldEl === this.$id('order')[0])
      {
        this.handleOrderChange();
      }
    },

    handleOrderChange: function(operationsBuilt)
    {
      if (!operationsBuilt)
      {
        operationsBuilt = _.noop;
      }

      var phrase = this.$id('order').val().replace(/[^0-9]+/g, '');
      var $group = this.$id('operationGroup');
      var list = this.buildOperationList(phrase, operationsBuilt);

      if (list.length)
      {
        operationsBuilt();
      }
      else
      {
        list = '<p><i class="fa fa-spinner fa-spin"></i></p>';
      }

      var $active = $group.find('div').html(list).find('.active');

      if ($active.length)
      {
        $active[0].scrollIntoView();
      }

      if (this.options.vkb)
      {
        this.options.vkb.reposition();
      }
    },

    buildOperationList: function(phrase, done)
    {
      var view = this;

      if (phrase.length !== 9)
      {
        done();

        return '<p>' + view.t('newOrderPicker:order:tooShort') + '</p>';
      }

      if (view.searchReq)
      {
        view.searchReq.abort();
      }

      view.searchReq = view.ajax({
        url: '/production/orders?' + this.model.getOrderIdType() + '=' + phrase
      });

      view.searchReq.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      view.searchReq.done(function(res)
      {
        view.lastOrders = res || [];

        var html = '';

        if (view.lastOrders.length)
        {
          html = view.buildOrderOperationList(view.lastOrders[0]);
        }
        else
        {
          html = '<p>' + view.t('newOrderPicker:order:notFound') + '</p>';
        }

        var $active = view.$id('operationGroup').find('div').html(html).find('.active');

        if ($active.length)
        {
          $active[0].scrollIntoView();
        }

        view.updateNewWorkerCount();

        if (view.options.vkb)
        {
          view.options.vkb.reposition();
        }

        viewport.adjustDialogBackdrop();
      });

      view.searchReq.always(function()
      {
        view.searchReq = null;

        done();
      });

      view.lastPhrase = phrase;

      return '';
    },

    buildOrderOperationList: function(order, active)
    {
      var html = '';

      if (!active)
      {
        active = orderPickerHelpers.getBestDefaultOperationNo(order.operations);
      }

      _.forEach(orderPickerHelpers.prepareOperations(order.operations), function(op)
      {
        if (!op.name)
        {
          return;
        }

        var className = 'btn btn-lg btn-default ' + (op.no === active ? 'active' : '');

        html += '<button type="button" class="' + className + '" data-operation="' + op.no + '">'
          + '<em>' + _.escape(op.no) + '</em><span>' + _.escape(op.name || '?') + '</span>'
          + '</button>';
      });

      return html.length ? html : ('<p>' + this.t('newOrderPicker:order:notFound') + '</p>');
    },

    updateNewWorkerCount: function(newWorkerCount)
    {
      var $newWorkerCount = this.$id('newWorkerCount').val('');

      if (!$newWorkerCount.length)
      {
        return;
      }

      if (newWorkerCount > 0)
      {
        $newWorkerCount.val(newWorkerCount.toString());

        return;
      }

      var orderNo = this.$id('order').val();
      var operationNo = this.$id('operationGroup').find('.active').attr('data-operation');
      var order = _.findWhere(this.lastOrders, {_id: orderNo})
        || _.findWhere(this.lastOrders, {no: orderNo});

      if (!order)
      {
        return;
      }

      var operation = _.findWhere(order.operations, {no: operationNo});

      if (!operation || operation.laborTime <= 0 || operation.machineTime <= 0)
      {
        return;
      }

      $newWorkerCount.val(Math.max(Math.round(operation.laborTime / operation.machineTime), 1));
    },

    checkMinMaxValidity: function(e)
    {
      var el = e.target;
      var val = parseInt(el.value, 10) || 0;
      var min = parseInt(el.getAttribute('min'), 10) || 0;
      var max = parseInt(el.getAttribute('max'), 10);
      var err = '';

      if (val < min)
      {
        err = this.t('error:min', {min: min});
      }
      else if (val > max)
      {
        err = this.t('error:max', {max: max});
      }

      el.setCustomValidity(err);
    }

  });
});
