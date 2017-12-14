// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'js2form',
  'form2js',
  'app/user',
  'app/time',
  'app/core/View',
  'app/core/views/PaginationView',
  'app/orders/views/OrderChangesView',
  'app/reports/templates/2/orders',
  'app/reports/templates/2/orderRow'
], function(
  $,
  js2form,
  form2js,
  user,
  time,
  View,
  PaginationView,
  OrderChangesView,
  ordersTemplate,
  orderRowTemplate
) {
  'use strict';

  return View.extend({

    template: ordersTemplate,

    events: {
      'submit #-filter': function()
      {
        this.filter();

        return false;
      },
      'click tr[data-id]': function(e)
      {
        if (e.target.tagName !== 'A')
        {
          this.showOrderChanges(e.currentTarget.dataset.id);
        }
      },
      'change input[name="filter"]': function()
      {
        this.$('input[name="statuses[]"]').prop('disabled', this.$('input[name="filter"]:checked').val() === 'red');
      }
    },

    initialize: function()
    {
      this.orderChangesView = null;
      this.paginationView = new PaginationView({
        replaceUrl: true,
        model: this.collection.paginationData
      });

      this.setView('.pagination-container', this.paginationView);

      this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
      this.listenTo(this.collection.query, 'change', this.setFilterFieldValues);
      this.listenTo(this.collection, 'change:delayReason', this.onDelayReasonChange);
      this.listenTo(this.collection, 'push:change', this.onChangePush);
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
        orders: this.collection.map(this.serializeOrder, this)
      };
    },

    serializeOrder: function(order)
    {
      var statusesSetAt = order.get('statusesSetAt');
      var cnfStatus;
      var cnfClassName;
      var cnfTime;
      var dlvStatus;
      var dlvClassName;
      var dlvTime;

      if (statusesSetAt.CNF)
      {
        cnfStatus = 'CNF';
        cnfClassName = 'full';
        cnfTime = statusesSetAt.CNF;
      }
      else if (statusesSetAt.PCNF)
      {
        cnfStatus = 'PCNF';
        cnfClassName = 'partial';
        cnfTime = statusesSetAt.PCNF;
      }
      else
      {
        cnfStatus = '-';
        cnfClassName = 'none';
      }

      if (statusesSetAt.DLV)
      {
        dlvStatus = 'DLV';
        dlvClassName = 'full';
        dlvTime = statusesSetAt.DLV;
      }
      else if (statusesSetAt.PDLV)
      {
        dlvStatus = 'PDLV';
        dlvClassName = 'partial';
        dlvTime = statusesSetAt.PDLV;
      }
      else
      {
        dlvStatus = '-';
        dlvClassName = 'none';
      }

      var delayReason = this.delayReasons.get(order.get('delayReason'));
      var startDate = order.get('scheduledStartDate');

      return {
        className: cnfClassName === 'none' || dlvClassName === 'none'
          ? 'danger'
          : cnfClassName === 'partial' || dlvClassName === 'partial'
            ? 'warning'
            : 'success',
        no: order.id,
        name: order.get('name'),
        mrp: order.get('mrp'),
        qty: (order.get('qty') || 0).toLocaleString(),
        finishDate: startDate ? time.format(startDate, 'LL') : '-',
        cnfStatus: cnfStatus,
        cnfClassName: cnfClassName,
        cnfTime: cnfTime ? time.format(cnfTime, 'LLL') : '-',
        dlvStatus: dlvStatus,
        dlvClassName: dlvClassName,
        dlvTime: dlvTime ? time.format(dlvTime, 'LLL') : '-',
        delayReason: delayReason ? delayReason.getLabel() : '-'
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

      this.setFilterFieldValues();
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

    setFilterFieldValues: function()
    {
      var query = this.collection.query;
      var hour = parseInt(query.get('hour'), 10);

      if (isNaN(hour) || hour < 0 || hour > 24)
      {
        hour = '';
      }
      else if (hour < 10)
      {
        hour = '0' + hour + ':00';
      }
      else
      {
        hour += ':00';
      }

      js2form(this.$id('filter')[0], {
        orderNo: query.get('orderNo'),
        hourMode: query.get('hourMode'),
        hour: hour,
        filter: query.get('filter'),
        statuses: query.get('statuses').split(','),
        limit: query.get('limit')
      });
    },

    filter: function()
    {
      var filterData = form2js(this.$id('filter')[0]);
      var hour = (filterData.hour || '').split(':').map(function(v) { return +v; })[0];

      if (isNaN(hour) || hour < 0 || hour > 24)
      {
        hour = '';
      }

      filterData.orderNo = (filterData.orderNo || '').length < 6 ? '' : filterData.orderNo;
      filterData.hour = hour.toString();
      filterData.statuses = Array.isArray(filterData.statuses) ? filterData.statuses.join(',') : '';
      filterData.skip = 0;

      this.collection.query.set(filterData, {refreshCharts: false});
    },

    showOrderChanges: function(orderNo)
    {
      var $orderTr = this.$('tr[data-id="' + orderNo + '"]');
      var sameOrder = $orderTr.next('.reports-2-changes').length;

      this.hideOrderChanges();

      if (sameOrder)
      {
        return;
      }

      var $changesTr = $('<tr class="reports-2-changes hidden"><td colspan="10"></td></tr>');
      var $changesTd = $changesTr.find('td');

      this.orderChangesView = new OrderChangesView({
        model: this.collection.get(orderNo),
        delayReasons: this.delayReasons,
        showPanel: false
      });

      $changesTd.append(this.orderChangesView.el);
      $changesTr.insertAfter($orderTr);

      this.orderChangesView.render();

      $changesTr.removeClass('hidden');
    },

    hideOrderChanges: function()
    {
      if (this.orderChangesView !== null)
      {
        var $changesTr = this.orderChangesView.$el.closest('.reports-2-changes');

        this.orderChangesView.remove();
        $changesTr.remove();

        this.orderChangesView = null;
      }
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

      this.$id('orders')
        .find('tr[data-id="' + order.id + '"]')
        .find('.reports-2-orders-delayReason')
        .text(delayReason ? delayReason.getLabel() : '-');
    }

  });
});
