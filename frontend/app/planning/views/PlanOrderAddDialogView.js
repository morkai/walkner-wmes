// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker',
  'app/i18n',
  'app/viewport',
  'app/time',
  'app/core/View',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/orderAddDialog',
  'app/planning/templates/orderAddDetails'
], function(
  broker,
  t,
  viewport,
  time,
  View,
  renderOrderStatusLabel,
  template,
  orderAddDetailsTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'input #-orderNo': 'searchOrder'

    },

    initialize: function()
    {
      this.order = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orderNo: this.order ? this.order._id : (this.model.orderNo || '')
      };
    },

    afterRender: function()
    {
      this.searchOrder();
    },

    showMessage: function(message)
    {
      if (!message)
      {
        this.$id('message').addClass('hidden');
      }
      else
      {
        this.$id('message').html(t('planning', 'orders:add:' + message)).removeClass('hidden');
      }
    },

    searchOrder: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var orderNo = view.$id('orderNo').val().replace(/[^0-9]+/g, '');

      view.$id('details').addClass('hidden');

      if (orderNo.length !== 9)
      {
        return view.showMessage('invalidOrderNo');
      }

      view.showMessage('searching');

      var req = view.ajax({url: '/planning/plans/' + view.plan.id + '/orders/' + orderNo});

      req.fail(function(jqXhr)
      {
        var error = jqXhr.responseJSON && jqXhr.responseJSON.error && jqXhr.responseJSON.error.message || '';

        if (t.has('planning', 'orders:add:' + error))
        {
          view.showMessage(error);
        }
        else
        {
          view.showMessage('searchFailed');
        }
      });

      req.done(function(res)
      {
        var error = view.validateOrder(res);

        view.showMessage(error);
        view.showDetails(res);

        if (!error)
        {
          view.order = res.order;

          $submit.prop('disabled', false);
        }
      });
    },

    validateOrder: function(data)
    {
      var plans = data.plans;

      for (var i = 0; i < plans.length; ++i)
      {
        if (time.utc.format(plans[i], 'YYYY-MM-DD') === this.plan.id)
        {
          return 'alreadyExists';
        }
      }

      var order = data.order;

      if (time.utc.getMoment(order.date, 'YYYY-MM-DD').diff(time.utc.getMoment(this.plan.id)) > 0)
      {
        return 'future';
      }

      if (!this.plan.settings.mrps.get(order.mrp))
      {
        return 'undefinedMrp';
      }

      if (!this.plan.settings.hasAllRequiredStatuses(order.statuses))
      {
        return 'requiredStatus';
      }

      if (this.plan.settings.hasAnyIgnoredStatus(order.statuses))
      {
        return 'ignoredStatus';
      }

      return null;
    },

    showDetails: function(data)
    {
      data.order.statuses = data.order.statuses.map(renderOrderStatusLabel).join('');

      this.$id('details').html(orderAddDetailsTemplate(data)).removeClass('hidden');
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var req = view.ajax({
        method: 'POST',
        url: '/planning/plans/' + view.plan.id + '/orders/' + view.order._id
      });

      req.done(function()
      {
        broker.subscribe('viewport.dialog.hidden', view.previewAddedOrder.bind(view)).setLimit(1);

        viewport.closeDialog();
      });
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'orders:add:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    previewAddedOrder: function()
    {
      var planMrp = this.plan.mrps.get(this.order.mrp);

      if (planMrp)
      {
        planMrp.orders.trigger('preview', {
          orderNo: this.order._id,
          scrollIntoView: true
        });
      }
    },

    onDialogShown: function()
    {
      this.$id('orderNo').focus();
    }

  });
});
