// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/views/DetailsView',
  'app/data/orderStatuses',
  'app/orders/templates/details',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  $,
  t,
  user,
  viewport,
  DetailsView,
  orderStatuses,
  detailsTemplate,
  renderOrderStatusLabel
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    events: {

      'click #-changeQtyMax': function(e)
      {
        var view = this;
        var $link = view.$(e.currentTarget).addClass('hidden');
        var $propValue = $link.closest('.prop-value').css({
          position: 'relative'
        });
        var $input = $('<input class="form-control" type="number" min="0" max="9999">')
          .val(view.model.get('qtyMax') || view.model.get('qty') || 0)
          .css({
            position: 'absolute',
            top: '-1px',
            left: 0,
            width: '100px',
            height: '36px'
          });

        $input.on('blur', hide);

        $input.on('keyup', function(e)
        {
          if (e.keyCode === 27)
          {
            hide();
          }
          else if (e.keyCode === 13)
          {
            save();
          }
        });

        $input.appendTo($propValue).select();

        return false;

        function restore()
        {
          var qtyMax = view.model.get('qtyMax') || view.model.get('qty') || 0;
          var unit = view.model.get('unit') || 'PCE';

          view.$id('qtyMax').text(qtyMax.toLocaleString() + ' ' + unit);
        }

        function hide()
        {
          $input.remove();
          $link.removeClass('hidden');
        }

        function save()
        {
          var oldQtyMax = view.model.get('qtyMax') || 0;
          var newQtyMax = Math.min(9999, Math.max(0, parseInt($input.val(), 10))) || 0;

          if (newQtyMax === view.model.get('qty'))
          {
            newQtyMax = 0;
          }

          if (newQtyMax === oldQtyMax)
          {
            return hide();
          }

          view.$id('qtyMax').html('<i class="fa fa-spinner fa-spin"></i>');

          $input.remove();

          viewport.msg.saving();

          var req = view.ajax({
            method: 'POST',
            url: '/orders/' + view.model.id,
            data: JSON.stringify({
              qtyMax: newQtyMax
            })
          });

          req.fail(function()
          {
            viewport.msg.savingFailed();

            restore();
            hide();
          });

          req.done(function()
          {
            viewport.msg.saved();

            hide();

            view.model.set('qtyMax', newQtyMax);
          });
        }
      }

    },

    serialize: function()
    {
      var order = this.model.toJSON();
      var delayReason = this.delayReasons.get(order.delayReason);

      order.statusLabels = orderStatuses.findAndFill(order.statuses).map(renderOrderStatusLabel).join(' ');
      order.delayReason = delayReason ? delayReason.getLabel() : null;

      return {
        idPrefix: this.idPrefix,
        model: order,
        panelType: this.options.panelType || 'primary',
        panelTitle: this.options.panelTitle || t('orders', 'PANEL:TITLE:details'),
        linkOrderNo: !!this.options.linkOrderNo,
        showQtyMax: !!this.options.showQtyMax,
        canChangeQtyMax: !!this.options.showQtyMax && user.isAllowedTo('ORDERS:MANAGE', 'FN:master', 'FN:leader')
      };
    }

  });
});
