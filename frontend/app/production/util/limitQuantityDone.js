// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/socket',
  'app/i18n',
  'app/viewport'
], function(
  _,
  $,
  socket,
  t,
  viewport
) {
  'use strict';

  var NO_MAX_CHECK_LINES = {

  };

  return function limitQuantityDone(view, prodShiftOrder)
  {
    view.ft = {
      checkCredentials: null
    };

    if (!prodShiftOrder.id || !socket.isConnected())
    {
      return;
    }

    var $submit = view.$id('submit').prop('disabled', true);
    var requests = [
      requestFt(view, prodShiftOrder),
      requestMin(view, prodShiftOrder)
    ];

    if (prodShiftOrder.get('orderId') && !NO_MAX_CHECK_LINES[prodShiftOrder.get('prodLine')])
    {
      requests.push(requestMax(view, prodShiftOrder));
    }

    $.when.apply($, requests).always(function(ftResults)
    {
      checkFt(view, ftResults && ftResults[0]);

      $submit.prop('disabled', false);
    });
  };

  function requestMin(view, prodShiftOrder)
  {
    var url = '/prodSerialNumbers?limit(1)&prodShiftOrder=' + prodShiftOrder.id;

    return view.ajax({url: url, timeout: 10000}).done(function(res)
    {
      if (res && res.totalCount)
      {
        minMax(view, res.totalCount, null);
      }
    });
  }

  function requestMax(view, prodShiftOrder)
  {
    var url = '/orders/' + prodShiftOrder.get('orderId') + '?select(qty,qtyMax,qtyDone)';

    return view.ajax({url: url, timeout: 10000}).done(function(res)
    {
      var operation = prodShiftOrder.getOperation() || {
        no: prodShiftOrder.get('operationNo'),
        qty: res.qty
      };

      if (_.isEmpty(res.qtyDone))
      {
        res.qtyDone = {
          total: 0,
          byLine: {},
          byOperation: {}
        };
      }

      if (!res.qtyDone.byOperation[operation.no])
      {
        res.qtyDone.byOperation[operation.no] = 0;
      }

      if (_.isEmpty(res.qtyMax))
      {
        res.qtyMax = {};
      }

      if (!res.qtyMax[operation.no])
      {
        res.qtyMax[operation.no] = res.qty;
      }

      var qtyDoneInPso = prodShiftOrder.get('quantityDone');
      var qtyDoneInOperation = res.qtyDone.byOperation[operation.no];
      var qtyDone = qtyDoneInOperation - (qtyDoneInOperation >= qtyDoneInPso ? qtyDoneInPso : 0);
      var qtyMax = res.qtyMax[operation.no];
      var qtyRemaining = Math.max(0, qtyMax - qtyDone);

      minMax(view, 0, qtyRemaining);
    });
  }

  function minMax(view, newMin, newMax)
  {
    var $quantityDone = view.$id('quantityDone');
    var oldMin = parseInt($quantityDone.attr('min'), 10);
    var oldMax = parseInt($quantityDone.attr('max'), 10);

    if (isNaN(oldMin))
    {
      oldMin = 0;
    }

    if (isNaN(oldMax))
    {
      oldMax = 9999;
    }

    if (newMax === null)
    {
      newMax = oldMax;
    }

    if (newMin === null)
    {
      newMin = oldMin;
    }

    if (newMin > newMax)
    {
      newMin = newMax;
    }

    $quantityDone
      .attr('min', newMin)
      .attr('max', newMax)
      .trigger('input');
  }

  function requestFt(view, prodShiftOrder)
  {
    var url = '/xiconf/orders/' + prodShiftOrder.get('orderId');

    return view.ajax({url: url, timeout: 10000});
  }

  function checkFt(view, xiconfOrder)
  {
    if (!xiconfOrder)
    {
      return ftOk(view);
    }

    var ftItem = _.find(xiconfOrder.items, function(item) { return item.kind === 'ft'; });

    if (!ftItem || ftItem.quantityDone >= ftItem.quantityTodo)
    {
      return ftOk(view);
    }

    var $ft = view.$id('ft').removeClass('hidden');

    $ft.on('input', resetState);
    $ft.on('change', resetState);

    if (view.options.vkb)
    {
      view.options.vkb.reposition();
    }

    function resetState()
    {
      view.ft.checkCredentials = checkCredentials.bind(null, view);

      $ft.find('input').each(function() { this.setCustomValidity(''); });
    }
  }

  function ftOk(view)
  {
    view.$id('ft').remove();
  }

  function checkCredentials(view)
  {
    var login = view.$id('ft-login').val();
    var password = view.$id('ft-password').val();

    var req = view.ajax({
      method: 'POST',
      url: '/login?login=0',
      data: JSON.stringify({
        login: login,
        password: password
      })
    });

    req.fail(function()
    {
      var $login = view.$id('ft-login');

      if (!$login.length)
      {
        return;
      }

      if (req.status >= 400 && req.status < 500)
      {
        view.ft.checkCredentials = null;

        $login[0].setCustomValidity(t('production', 'ft:invalidCredentials'));
      }
      else if (!socket.isConnected())
      {
        view.ft.checkCredentials = null;
      }
      else
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('production', 'ft:requestFailure')
        });
      }
    });

    req.done(function(user)
    {
      if (user.super
        || /(engineer|leader)/i.test(user.prodFunction)
        || _.includes(user.privileges, 'OPERATOR:ORDER_UNLOCK'))
      {
        view.ft.checkCredentials = null;
      }
      else
      {
        view.$id('ft-login')[0].setCustomValidity(t('production', 'ft:noPrivileges'));
      }
    });

    req.always(function()
    {
      view.$id('submit').prop('disabled', false).click();
    });
  }
});
