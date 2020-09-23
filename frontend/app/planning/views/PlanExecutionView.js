// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/planning/templates/planExecution'
], function(
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      var view = this;
      var selectedMrp = view.mrp ? view.mrp.id : null;
      var cmpClass = {
        true: 'is-ok',
        false: 'is-nok'
      };

      return {
        mrps: view.plan.mrps.map(function(mrp)
        {
          if (selectedMrp && mrp.id !== selectedMrp)
          {
            return null;
          }

          return {
            _id: mrp.id,
            lines: mrp.lines.map(function(line)
            {
              var no = 1;

              return {
                _id: line.id,
                orders: line.orders.map(function(lineOrder)
                {
                  var orderNo = lineOrder.get('orderNo');
                  var planOrder = view.plan.orders.get(orderNo);

                  if (!planOrder)
                  {
                    return null;
                  }

                  var operationNo = planOrder.getOperationNo();
                  var quantityPlanned = lineOrder.get('quantity');
                  var startAt = time.utc.getMoment(lineOrder.get('startAt'));
                  var startAtDate = startAt.format('YYYY-MM-DD');
                  var shiftOrders = [];
                  var ok = false;

                  view.plan.shiftOrders.findOrders(orderNo).forEach(function(shiftOrder)
                  {
                    var opNo = shiftOrder.get('operationNo');

                    if (operationNo !== opNo)
                    {
                      return;
                    }

                    var prodLine = shiftOrder.get('prodLine');
                    var quantityDone = shiftOrder.get('quantityDone');
                    var startedAt = time.getMoment(shiftOrder.get('startedAt')).utc(true);
                    var startedAtDate = startedAt.format('YYYY-MM-DD');
                    var classNames = {
                      line: cmpClass[prodLine === line.id],
                      quantity: cmpClass[quantityDone === quantityPlanned],
                      date: cmpClass[startedAtDate === startAtDate],
                      time: cmpClass[Math.abs(startedAt.diff(startAt, 'minutes')) <= 240]
                    };

                    shiftOrders.push({
                      line: prodLine,
                      quantityDone: quantityDone,
                      startedAtTime: startedAt.format('HH:mm:ss'),
                      startedAtDate: startedAtDate,
                      startedAt: startedAt.valueOf(),
                      classNames: classNames,
                      ok: classNames.line === 'is-ok'
                        && classNames.quantity === 'is-ok'
                        && classNames.time === 'is-ok'
                    });

                    if (!ok)
                    {
                      ok = shiftOrders[shiftOrders.length - 1].ok;
                    }
                  });

                  var cmpOpt = {numeric: true, ignorePunctuation: true};

                  shiftOrders.sort(function(a, b)
                  {
                    if (a.line === line.id && b.line !== line.id)
                    {
                      return -1;
                    }

                    if (a.line !== line.id && b.line === line.id)
                    {
                      return 1;
                    }

                    var cmp = a.line.localeCompare(b.line, undefined, cmpOpt);

                    if (cmp === 0)
                    {
                      cmp = a.startedAt - b.startedAt;
                    }

                    return cmp;
                  });

                  return {
                    no: no++,
                    orderNo: orderNo,
                    quantityPlanned: quantityPlanned,
                    startAtTime: startAt.format('HH:mm:ss'),
                    startAtDate: startAtDate,
                    shiftOrders: shiftOrders,
                    ok: ok
                  };
                }).filter(order => !!order)
              };
            }).filter(line => !!line && line.orders.length)
          };
        }).filter(mrp => !!mrp)
      };
    },

    afterRender: function()
    {

    }

  });
});
