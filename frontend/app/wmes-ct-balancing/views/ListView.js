// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/ListView',
  'app/wmes-ct-balancing/templates/orderPopover'
], function(
  _,
  time,
  ListView,
  orderPopoverTemplate
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: {
      'ct.balancing.pces.updated': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: 'startedAt', className: 'is-min'},
        {id: 'duration', className: 'is-min text-right'},
        {id: 'order', className: 'is-min'},
        {id: 'line', className: 'is-min'},
        {id: 'station', className: 'is-min is-number', label: this.t('PROPERTY:station:short')},
        '-'
      ];
    },

    serializeActions: function()
    {
      return null;
    },

    afterRender: function()
    {
      var view = this;

      ListView.prototype.afterRender.apply(view, arguments);

      view.$el.popover({
        container: view.el,
        selector: 'td[data-id]',
        trigger: 'hover',
        placement: 'right',
        html: true,
        css: {
          maxWidth: '350px'
        },
        hasContent: function()
        {
          return this.dataset.id === 'order';
        },
        content: function()
        {
          var pce = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'order')
          {
            var order = pce.get('order');

            return view.renderPartialHtml(orderPopoverTemplate, {
              order: {
                _id: order._id,
                nc12: order.nc12,
                name: _.escape(order.name),
                mrp: order.mrp,
                qty: order.qty,
                workerCount: order.workerCount,
                sapTaktTime: time.toString(order.sapTaktTime, false, false)
              }
            });
          }
        }
      });
    }

  });
});
