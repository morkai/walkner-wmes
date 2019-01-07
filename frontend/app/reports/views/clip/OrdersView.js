// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/time',
  'app/core/View',
  'app/core/views/PaginationView',
  'app/orders/views/OrderChangesView',
  'app/reports/templates/clip/orders',
  'app/reports/templates/clip/orderRow'
], function(
  $,
  user,
  time,
  View,
  PaginationView,
  OrderChangesView,
  ordersTemplate,
  orderRowTemplate
) {
  'use strict';

  var FAP_STATUS_TO_LABEL = {
    pending: 'danger',
    started: 'info',
    finished: 'success',
    analysis: 'warning'
  };

  return View.extend({

    template: ordersTemplate,

    events: {
      'click tr[data-id]': function(e)
      {
        if (e.target.tagName !== 'A')
        {
          this.showOrderChanges(
            e.currentTarget.dataset.id,
            e.target.classList.contains('reports-2-orders-delayReason')
          );
        }
      }
    },

    initialize: function()
    {
      var view = this;
      var orders = this.collection;

      view.orderChangesView = null;
      view.paginationView = new PaginationView({
        replaceUrl: true,
        model: orders.paginationData
      });

      view.setView('.pagination-container', view.paginationView);

      view.listenTo(orders, 'change:delayReason change:m4', this.onDelayReasonChange);
      view.listenTo(orders, 'change:comment', this.onCommentChange);
      view.listenTo(orders, 'push:change', this.onChangePush);
      view.listenTo(orders.paginationData, 'change:page', this.scrollTop);
      view.listenTo(orders.displayOptions.settings, 'change', this.onSettingChange);

      $(document).on('');
    },

    destroy: function()
    {
      this.hideOrderChanges();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderOrderRow: orderRowTemplate,
        canViewOrders: user.isAllowedTo('ORDERS:VIEW'),
        dateProperty: this.collection.displayOptions.settings.getValue('clip.dateProperty', 'finishDate'),
        orders: this.collection.map(this.serializeOrder, this)
      };
    },

    serializeOrder: function(order)
    {
      var cnfStatus = order.get('productionStatus');
      var cnfTime = order.get('productionTime');
      var cnfClassName = cnfStatus === 'CNF' ? 'full' : cnfStatus === 'PCNF' ? 'partial' : 'none';
      var dlvStatus = order.get('endToEndStatus');
      var dlvTime = order.get('endToEndTime');
      var dlvClassName = dlvStatus === 'DLV' ? 'full' : dlvStatus === 'PDLV' ? 'partial' : 'none';
      var delayReason = this.delayReasons.get(order.get('delayReason'));
      var date = order.get(this.collection.displayOptions.settings.getValue('clip.dateProperty', 'finishDate'));
      var mrp = order.get('mrp');
      var confirmed = order.get('confirmed');
      var notConfirmed = cnfClassName === 'none' || dlvClassName === 'none';
      var partiallyConfirmed = cnfClassName === 'partial' || dlvClassName === 'partial';
      var className = 'success';

      if (!confirmed)
      {
        if (notConfirmed)
        {
          className = 'danger';
        }
        else if (partiallyConfirmed)
        {
          className = 'warning';
        }
      }

      if (date)
      {
        var moment = time.getMoment(date);
        var offset = this.collection.query.get('offset1') || 0;

        if (offset)
        {
          moment.add(offset, 'days');
        }

        date = moment.format('L');
      }
      else
      {
        date = '';
      }

      return {
        className: className,
        no: order.id,
        name: order.get('name'),
        mrp: mrp,
        qty: (order.get('qtyDone') || 0).toLocaleString() + '/' + (order.get('qty') || 0).toLocaleString(),
        date: date,
        cnfStatus: cnfStatus || '',
        cnfClassName: cnfClassName,
        cnfTime: cnfTime ? time.format(cnfTime, 'L, HH:mm') : '',
        dlvStatus: dlvStatus || '',
        dlvClassName: dlvClassName,
        dlvTime: dlvTime ? time.format(dlvTime, 'L, HH:mm') : '',
        delayReason: delayReason ? delayReason.getLabel() : '',
        m4: order.get('m4'),
        drm: order.get('drm'),
        eto: order.get('eto'),
        comment: order.get('comment'),
        planner: this.planners.getLabel(mrp),
        faps: (order.get('faps') || []).map(function(fap)
        {
          fap.label = FAP_STATUS_TO_LABEL[fap.status];

          return fap;
        })
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.collection, 'request');
      this.stopListening(this.collection, 'sync');
    },

    afterRender: function()
    {
      this.listenTo(this.collection, 'request', this.onCollectionRequest);
      this.listenTo(this.collection, 'sync', this.onCollectionSync);

      if (localStorage.getItem('WMES_NO_SYSTEM_CHANGES') !== '0')
      {
        this.$el.addClass('clip-no-system-changes');
      }
    },

    renderOrderRows: function()
    {
      var html = '';
      var canViewOrders = user.isAllowedTo('ORDERS:VIEW');

      for (var i = 0, l = this.collection.length; i < l; ++i)
      {
        html += orderRowTemplate({
          canViewOrders: canViewOrders,
          order: this.serializeOrder(this.collection.at(i))
        });
      }

      this.hideOrderChanges();
      this.$id('orders').html(html);
    },

    scrollTop: function()
    {
      var y = this.$el.offset().top - 14;
      var $navbar = $('.navbar-fixed-top');

      if ($navbar.length)
      {
        y -= $navbar.outerHeight();
      }

      if (window.scrollY > y)
      {
        $('html, body').stop(true, false).animate({scrollTop: y}, 'fast');
      }
    },

    showOrderChanges: function(orderNo, focusComment)
    {
      var view = this;
      var $orderTr = view.$('tr[data-id="' + orderNo + '"]');
      var sameOrder = $orderTr.next('.reports-2-changes').length;

      view.hideOrderChanges();

      if (sameOrder)
      {
        return;
      }

      var order = view.collection.get(orderNo);

      if (order.get('changes'))
      {
        return view.renderOrderChanges(order, $orderTr, focusComment);
      }

      view.req = view.ajax({url: '/orders/' + orderNo + '?select(changes)'});

      view.$el.css('cursor', 'wait');

      view.req.done(function(res)
      {
        order.set('changes', res.changes);
        view.renderOrderChanges(order, $orderTr, focusComment);
      });

      view.req.always(function()
      {
        view.$el.css('cursor', '');
      });
    },

    renderOrderChanges: function(order, $orderTr, focusComment)
    {
      var $changesTr = $('<tr class="reports-2-changes hidden"><td colspan="999"></td></tr>');
      var $changesTd = $changesTr.find('td');

      this.orderChangesView = new OrderChangesView({
        model: order,
        delayReasons: this.delayReasons,
        showPanel: false
      });

      $changesTd.append(this.orderChangesView.el);
      $changesTr.insertAfter($orderTr);

      this.orderChangesView.render();

      $changesTr.removeClass('hidden');

      if (focusComment)
      {
        $changesTr.find('input[name="delayReason"]').select2('focus');
      }

      var $toggleSystemChanges = $('<button class="btn btn-default btn-lg clip-toggleSystemChanges"></button>')
        .attr({
          id: this.idPrefix + '-toggleSystemChanges'
        })
        .text(this.t('reports', 'clip:toggleSystemChanges'))
        .toggleClass('active', localStorage.getItem('WMES_NO_SYSTEM_CHANGES') !== '0')
        .on('click', this.toggleSystemChanges.bind(this));

      this.$el.append($toggleSystemChanges);
    },

    toggleSystemChanges: function()
    {
      var oldValue = localStorage.getItem('WMES_NO_SYSTEM_CHANGES') === '0' ? '0' : '1';
      var newValue = oldValue === '0' ? '1' : '0';

      localStorage.setItem('WMES_NO_SYSTEM_CHANGES', newValue);

      this.$id('toggleSystemChanges').toggleClass('active', newValue === '1');
      this.$el.toggleClass('clip-no-system-changes', newValue === '1');
    },

    hideOrderChanges: function()
    {
      if (this.req)
      {
        this.req.abort();
        this.req = null;
      }

      if (this.orderChangesView !== null)
      {
        var $changesTr = this.orderChangesView.$el.closest('.reports-2-changes');

        this.orderChangesView.remove();
        $changesTr.remove();

        this.orderChangesView = null;
      }

      this.$id('toggleSystemChanges').remove();
    },

    onCollectionRequest: function()
    {
      this.$id('empty').addClass('hidden');
    },

    onCollectionSync: function()
    {
      this.$id('empty').toggleClass('hidden', this.collection.length !== 0);
      this.$id('orders').toggleClass('hidden', this.collection.length === 0);

      this.renderOrderRows();
      this.paginationView.render();
    },

    onDelayReasonChange: function(order)
    {
      var delayReason = this.delayReasons.get(order.get('delayReason'));
      var text = '';

      if (delayReason)
      {
        text = delayReason.getLabel() + ' (' + this.t('orders', 'm4:' + order.get('m4'));

        var drm = delayReason.get('drm')[order.get('m4')];

        if (drm)
        {
          text += '; ' + drm;
        }

        text += ')';
      }

      this.$id('orders')
        .find('tr[data-id="' + order.id + '"]')
        .find('.reports-2-orders-delayReason')
        .text(text);
    },

    onSettingChange: function(setting)
    {
      if (setting.id === 'reports.clip.dateProperty')
      {
        this.$id('dateProperty').html(this.t('orders:' + setting.getValue()));
      }
    }

  });
});
