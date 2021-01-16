// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  './WhProblemDetailsView',
  'app/wh/templates/problems/list',
  'app/wh/templates/problems/listItem'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  WhProblemDetailsView,
  listTemplate,
  itemTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    events: {
      'click .wh-problems-item': function(e)
      {
        if (this.$(e.target).closest('a').length)
        {
          return;
        }

        this.showProblemDetails(e.currentTarget.dataset.id);
      }
    },

    initialize: function()
    {
      var view = this;

      view.model = view.whOrders;

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'add', view.onOrderAdded);
      view.listenTo(view.whOrders, 'remove', view.onOrderRemoved);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);
    },

    getTemplateData: function()
    {
      return {
        renderItem: this.renderPartialHtml.bind(this, itemTemplate),
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      var view = this;

      return view.whOrders.map(function(whOrder)
      {
        return view.serializeItem(whOrder);
      });
    },

    serializeItem: function(whOrder)
    {
      var urls = {
        order: '',
        pickup: ''
      };

      if (user.isAllowedTo('LOCAL', 'ORDERS:VIEW') && !this.options.embedded)
      {
        urls.order = '#orders/' + whOrder.get('order');
      }

      var date = time.utc.format(whOrder.get('date'), 'YYYY-MM-DD');

      if (this.options.embedded)
      {
        urls.pickup = '/wh-pickup#?date=' + date + '&order=' + whOrder.id;
      }
      else
      {
        urls.pickup = '#wh/pickup/' + date + '?order=' + whOrder.id;
      }

      var problemAt = whOrder.get('problemAt');

      return {
        _id: whOrder.id,
        order: whOrder.get('order'),
        line: whOrder.get('line'),
        qty: whOrder.get('qty').toLocaleString(),
        date: time.utc.format(whOrder.get('date'), 'LL'),
        startTime: time.utc.format(whOrder.get('startTime'), 'L HH:mm:ss'),
        problemAt: problemAt ? time.utc.format(problemAt, 'L HH:mm:ss') : '',
        funcs: whOrder.serializeProblemFuncs(),
        urls: urls
      };
    },

    $item: function(id)
    {
      return this.$('.wh-problems-item[data-id="' + id + '"]');
    },

    showProblemDetails: function(id)
    {
      var whOrder = this.whOrders.get(id);
      var detailsView = new WhProblemDetailsView({
        model: whOrder,
        whOrders: this.whOrders
      });

      viewport.showDialog(detailsView, this.t('problem:title', {
        orderNo: whOrder.get('order'),
        line: whOrder.get('line')
      }));
    },

    toggleEmpty: function()
    {
      this.$el.toggleClass('is-empty', this.whOrders.length === 0);
    },

    onOrdersReset: function()
    {
      this.render();
    },

    onOrderAdded: function(whOrder)
    {
      this.$el.append(this.renderPartialHtml(itemTemplate, {
        item: this.serializeItem(whOrder)
      }));
      this.toggleEmpty();
    },

    onOrderRemoved: function(whOrder)
    {
      this.$item(whOrder.id).remove();
      this.toggleEmpty();
    },

    onOrderChanged: function(whOrder)
    {
      var $item = this.$item(whOrder.id);

      if ($item.length)
      {
        $item.replaceWith(this.renderPartialHtml(itemTemplate, {
          item: this.serializeItem(whOrder)
        }));
      }
    }

  });
});
