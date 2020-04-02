// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/decimalSeparator',
  'app/orders/templates/operationList'
], function(
  _,
  $,
  user,
  viewport,
  View,
  decimalSeparator,
  operationListTemplate
) {
  'use strict';

  var TIME_PROPS = {
    machineSetupTime: 'sapMachineSetupTime',
    laborSetupTime: 'sapLaborSetupTime',
    machineTime: 'sapMachineTime',
    laborTime: 'sapLaborTime'
  };

  function formatNumericProperty(obj, prop)
  {
    if (obj[prop])
    {
      obj[prop] = (Math.round(obj[prop] * 1000) / 1000).toLocaleString();

      var parts = obj[prop].split(decimalSeparator);

      if (!parts[1])
      {
        parts[1] = '';
      }

      while (parts[1].length < 3)
      {
        parts[1] += '0';
      }

      obj[prop] = parts.join(decimalSeparator);
    }
    else
    {
      obj[prop] = '';
    }
  }

  return View.extend({

    template: operationListTemplate,

    nlsDomain: 'orders',

    events: {

      'click [data-action="changeQtyMax"]': function(e)
      {
        var view = this;
        var $link = view.$(e.currentTarget).find('a').addClass('hidden');

        if (!$link.length)
        {
          return;
        }

        var $td = $link.closest('td').css({
          position: 'relative'
        });
        var operationNo = $link[0].dataset.operationNo;
        var qty = +$link[0].dataset.qty;
        var oldQtyMax = +$link[0].dataset.qtyMax;
        var $input = $('<input class="form-control" type="number" min="0" max="9999">')
          .val(oldQtyMax)
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

        $input.appendTo($td).select();

        return false;

        function hide()
        {
          $input.remove();
          $link.removeClass('hidden');
        }

        function save()
        {
          var newQtyMax = Math.min(9999, Math.max(0, parseInt($input.val(), 10))) || 0;

          if (newQtyMax === qty)
          {
            newQtyMax = 0;
          }

          if (newQtyMax === oldQtyMax)
          {
            return hide();
          }

          $link.html('<i class="fa fa-spinner fa-spin"></i>');
          $input.remove();

          viewport.msg.saving();

          var req = view.ajax({
            method: 'POST',
            url: '/orders/' + view.model.id,
            data: JSON.stringify({
              operationNo: operationNo,
              qtyMax: newQtyMax
            })
          });

          req.fail(function()
          {
            viewport.msg.savingFailed();

            $link.text(oldQtyMax.toLocaleString() + ' ' + (view.model.get('unit') || 'PCE'));

            hide();
          });

          req.done(function()
          {
            viewport.msg.saved();

            hide();

            var qtyMax = {};

            qtyMax[operationNo] = newQtyMax;

            view.model.set('qtyMax', _.defaults(qtyMax, view.model.get('qtyMax')));
          });
        }
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:operations change:qtyMax change:qtyDone', this.onChange);
      });
    },

    getTemplateData: function()
    {
      return {
        operations: this.serializeOperations(),
        highlighted: this.options.highlighted,
        timeProps: Object.keys(TIME_PROPS),
        showQty: this.options.showQty !== false,
        showQtyMax: !!this.options.showQtyMax,
        canChangeQtyMax: !!this.options.showQtyMax && user.isAllowedTo('ORDERS:MANAGE', 'FN:master')
      };
    },

    serializeOperations: function()
    {
      var summedTimes = {};

      _.forEach(this.options.summedTimes, function(v, k)
      {
        summedTimes[k] = (Math.round(v * 1000) / 1000).toLocaleString();
      });

      var qtyDone = this.model.get('qtyDone') || {byOperation: {}};
      var qtyMax = this.model.get('qtyMax') || {};

      return this.model.get('operations')
        .toJSON()
        .map(function(op)
        {
          if (!op.qty)
          {
            op.qty = 0;
          }

          if (!op.unit)
          {
            op.unit = 'PCE';
          }

          op.qtyDone = (qtyDone.byOperation || {})[op.no] || 0;
          op.qtyMax = qtyMax[op.no] || op.qty || 0;
          op.qtyMaxUnit = op.qtyMax.toLocaleString() + ' ' + op.unit;

          op.times = {
            actual: {},
            sap: {},
            summed: {}
          };

          Object.keys(TIME_PROPS).forEach(function(key)
          {
            var sapKey = TIME_PROPS[key];

            formatNumericProperty(op, key);
            formatNumericProperty(op, sapKey);

            op.times.actual[key] = op[key];
            op.times.sap[key] = op[sapKey];
            op.times.summed[key] = summedTimes[key];
          });

          return op;
        })
        .sort(function(a, b) { return a.no - b.no; });
    },

    onChange: function()
    {
      var oldState = this.$el.hasClass('hidden');
      var newState = this.model.get('operations').length === 0;

      this.render();

      if (oldState !== newState)
      {
        this.model.trigger('panelToggle');
      }
    }

  });
});
