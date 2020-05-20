// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../core/util/getShiftStartInfo',
  '../core/Collection',
  './PaintShopOrder'
], function(
  _,
  $,
  time,
  getShiftStartInfo,
  Collection,
  PaintShopOrder
) {
  'use strict';

  function createEmptyTotals()
  {
    return {
      new: 0,
      started: 0,
      started1: 0,
      started2: 0,
      partial: 0,
      finished: 0,
      delivered: 0,
      aside: 0,
      cancelled: 0
    };
  }

  return Collection.extend({

    model: PaintShopOrder,

    comparator: 'no',

    initialize: function(models, options)
    {
      if (!options)
      {
        options = {};
      }

      var psOrders = this;

      psOrders.settings = options.settings || null;
      psOrders.paints = options.paints || null;
      psOrders.dropZones = options.dropZones || null;
      psOrders.drillingOrders = options.drillingOrders || null;
      psOrders.whOrders = options.whOrders || null;
      psOrders.user = options.user || null;
      psOrders.selectedMrp = options.selectedMrp || 'all';
      psOrders.selectedPaint = options.selectedPaint || 'all';

      psOrders.allMrps = null;
      psOrders.serializedList = null;
      psOrders.serializedMap = null;
      psOrders.byOrderNo = null;
      psOrders.totalQuantities = {};

      psOrders.on('reset request', resetCache);

      psOrders.on('change', function(order)
      {
        if (psOrders.serializedMap && psOrders.serializedMap[order.id])
        {
          _.assign(psOrders.serializedMap[order.id], order.serialize(true, psOrders.paints, psOrders));
        }
      });

      if (psOrders.drillingOrders)
      {
        psOrders.listenTo(psOrders.drillingOrders, 'add remove change', function(drillingOrder)
        {
          if (!psOrders.byOrderNo)
          {
            return;
          }

          var orders = psOrders.byOrderNo[drillingOrder.get('order')];

          if (!orders)
          {
            return;
          }

          orders.forEach(function(psOrder)
          {
            psOrders.trigger('change', psOrder, {drilling: true});
          });
        });
      }

      if (psOrders.whOrders)
      {
        psOrders.listenTo(psOrders.whOrders, 'reset', resetCache);

        psOrders.listenTo(psOrders.whOrders, 'change', function(whOrder)
        {
          if (!psOrders.byOrderNo)
          {
            return;
          }

          var orders = psOrders.byOrderNo[whOrder.get('order')];

          if (!orders)
          {
            return;
          }

          orders.forEach(function(whOrder)
          {
            psOrders.trigger('change', whOrder, {wh: true});
          });
        });
      }

      function resetCache()
      {
        psOrders.serializedList = null;
        psOrders.serializedMap = null;
        psOrders.byOrderNo = null;
      }
    },

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(PaintShopOrder.parse);
    },

    genClientUrl: function()
    {
      return '/paintShop/' + this.getDateFilter();
    },

    isDateFilter: function(expected)
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === expected;
      });
    },

    getDateFilter: function(format)
    {
      var dateFilter = null;

      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date')
        {
          dateFilter = time.utc.getMoment(term.args[1], 'YYYY-MM-DD').format(format || 'YYYY-MM-DD');
        }
      });

      return dateFilter;
    },

    setDateFilter: function(newDate)
    {
      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date')
        {
          term.args[1] = newDate;
        }
      });
    },

    selectMrp: function(newSelectedMrp)
    {
      this.selectedMrp = this.selectedMrp === newSelectedMrp ? 'all' : newSelectedMrp;

      this.trigger('mrpSelected');
    },

    selectPaint: function(newSelectedPaint)
    {
      if (newSelectedPaint === this.selectedPaint)
      {
        return;
      }

      this.selectedPaint = this.selectedPaint === newSelectedPaint ? 'all' : newSelectedPaint;

      this.trigger('paintSelected');
    },

    isVisible: function(serializedOrder)
    {
      return this.isMrpVisible(serializedOrder) && this.isPaintVisible(serializedOrder);
    },

    isMrpVisible: function(serializedOrder)
    {
      return this.selectedMrp === 'all'
        || serializedOrder.mrp === this.selectedMrp
        || (this.isDrillingMrpSelected() && serializedOrder.mrps.indexOf(this.selectedMrp) !== -1);
    },

    isDrillingMrp: function(mrp)
    {
      return mrp === PaintShopOrder.DRILLING_MRP;
    },

    isDrillingMrpSelected: function()
    {
      return this.selectedMrp === PaintShopOrder.DRILLING_MRP;
    },

    isPaintVisible: function(serializedOrder)
    {
      if (this.selectedPaint === 'all')
      {
        return true;
      }

      if (this.selectedPaint !== 'msp')
      {
        return serializedOrder.paints[this.selectedPaint] > 0;
      }

      var mspPaints = this.settings.getValue('mspPaints');

      if (!mspPaints && !mspPaints.length)
      {
        return false;
      }

      for (var i = 0; i < mspPaints.length; ++i)
      {
        if (serializedOrder.paints[mspPaints[i]])
        {
          return true;
        }
      }

      return false;
    },

    getFirstByOrderNo: function(orderNo)
    {
      return this.find(function(o)
      {
        if (o.get('order') === orderNo)
        {
          return true;
        }

        return _.some(o.get('childOrders'), function(childOrder)
        {
          return childOrder.order === orderNo;
        });
      });
    },

    getChildOrderDropZoneClass: function(childOrder, order)
    {
      if (!this.dropZones || !this.settings || order.status === 'cancelled')
      {
        return '';
      }

      var selectedPaint = this.selectedPaint;

      if (selectedPaint === 'all')
      {
        for (var i = 0; i < childOrder.paintList.length; ++i)
        {
          if (this.dropZones.getState(childOrder.paintList[i]))
          {
            return 'is-dropped';
          }
        }

        return '';
      }

      if (selectedPaint === 'msp')
      {
        var mspPaints = this.settings.getValue('mspPaints');
        var hasMspPaint = false;

        for (var j = 0; j < mspPaints.length; ++j)
        {
          if (childOrder.paints[mspPaints[j]])
          {
            hasMspPaint = true;

            break;
          }
        }

        if (hasMspPaint)
        {
          return this.dropZones.getState('msp') ? 'is-dropped' : 'is-droppable';
        }

        return 'is-undroppable';
      }

      if (childOrder.paints[selectedPaint])
      {
        return this.dropZones.getState(selectedPaint) ? 'is-dropped' : 'is-droppable';
      }

      return 'is-undroppable';
    },

    serialize: function(force)
    {
      var orders = this;

      if (!force && orders.serializedList)
      {
        return orders.serializedList;
      }

      var serializedList = [];
      var serializedMap = {};
      var byOrderNo = {};
      var mrpMap = {};
      var paintToMrpMap = {};
      var totalQuantities = {
        all: createEmptyTotals()
      };

      orders.forEach(function(order)
      {
        var serializedOrder = serializedMap[order.id] = order.serialize(true, orders.paints, orders);

        if (!byOrderNo[serializedOrder.order])
        {
          byOrderNo[serializedOrder.order] = [];
        }

        byOrderNo[serializedOrder.order].push(order);

        serializedList.push(serializedOrder);

        mrpMap[serializedOrder.mrp] = 1;

        _.forEach(serializedOrder.paints, function(qty, paint)
        {
          if (!paintToMrpMap[paint])
          {
            paintToMrpMap[paint] = {};
          }

          paintToMrpMap[paint][serializedOrder.mrp] = 1;
        });

        if (serializedOrder.drilling)
        {
          mrpMap[PaintShopOrder.DRILLING_MRP] = 1;
        }

        orders.recountOrder(totalQuantities, serializedOrder);
      });

      orders.serializedList = serializedList;
      orders.serializedMap = serializedMap;
      orders.byOrderNo = byOrderNo;
      orders.paintToMrp = paintToMrpMap;
      orders.allMrps = Object.keys(mrpMap).sort();
      orders.totalQuantities = totalQuantities;

      if (orders.selectedMrp !== 'all' && !mrpMap[orders.selectedMrp])
      {
        orders.selectMrp('all');
      }

      return serializedList;
    },

    serializeTotals: function()
    {
      if (this.selectedPaint === 'all')
      {
        return this.totalQuantities[this.selectedMrp];
      }

      if (this.selectedPaint === 'msp')
      {
        return this.serializeMspTotals();
      }

      if (this.selectedMrp === 'all')
      {
        return this.totalQuantities[this.selectedPaint] || createEmptyTotals();
      }

      return this.totalQuantities[this.selectedMrp + this.selectedPaint] || createEmptyTotals();
    },

    serializeMspTotals: function()
    {
      var orders = this;
      var mspTotals = createEmptyTotals();
      var mspPaints = orders.settings.getValue('mspPaints') || [];

      if (mspPaints.length === 0)
      {
        return mspTotals;
      }

      var mrp = orders.selectedMrp === 'all' ? '' : orders.selectedMrp;
      var keys = Object.keys(mspTotals);

      mspPaints.forEach(function(paint)
      {
        var paintTotals = orders.totalQuantities[mrp + paint];

        if (!paintTotals)
        {
          return;
        }

        keys.forEach(function(k)
        {
          mspTotals[k] += paintTotals[k];
        });
      });

      return mspTotals;
    },

    recountTotals: function()
    {
      this.totalQuantities = {
        all: createEmptyTotals()
      };

      (this.serializedList || []).forEach(this.recountOrder.bind(this, this.totalQuantities));

      this.trigger('totalsRecounted');
    },

    recountOrder: function(totalQuantities, order)
    {
      var mrp = order.mrp;
      var status = order.status;
      var cabin = status === 'started' && order.cabin ? ('started' + order.cabin) : null;
      var qtyPaint = order.qtyPaint;
      var qtyPaintPce = order.qtyPaint / order.qty;
      var qtyPaintDlv = 0;

      if (status === 'finished' && order.qtyDlv)
      {
        qtyPaintDlv = qtyPaintPce * order.qtyDlv;
        qtyPaint -= qtyPaintDlv;
      }

      if (!totalQuantities[mrp])
      {
        totalQuantities[mrp] = createEmptyTotals();
      }

      totalQuantities.all[status] += qtyPaint;
      totalQuantities[mrp][status] += qtyPaint;
      totalQuantities.all.delivered += qtyPaintDlv;
      totalQuantities[mrp].delivered += qtyPaintDlv;

      if (cabin)
      {
        totalQuantities.all[cabin] += qtyPaint;
        totalQuantities[mrp][cabin] += qtyPaint;
      }

      Object.keys(order.paints).forEach(function(paint)
      {
        var qtyPaint = order.paints[paint];
        var mrpPaint = mrp + paint;

        if (!totalQuantities[paint])
        {
          totalQuantities[paint] = createEmptyTotals();
        }

        if (!totalQuantities[mrpPaint])
        {
          totalQuantities[mrpPaint] = createEmptyTotals();
        }

        totalQuantities[paint][status] += qtyPaint;
        totalQuantities[mrpPaint][status] += qtyPaint;
        totalQuantities[paint].delivered += qtyPaint;
        totalQuantities[mrpPaint].delivered += qtyPaint;

        if (cabin)
        {
          totalQuantities[paint][cabin] += qtyPaint;
          totalQuantities[mrpPaint][cabin] += qtyPaint;
        }
      });
    },

    act: function(reqData, done)
    {
      var collection = this;
      var url = collection.url;

      if (reqData.orderId)
      {
        url = '/paintShop/orders/' + reqData.orderId;
      }

      if (collection.user)
      {
        reqData.user = collection.user;
      }

      var req = $.ajax({
        method: 'PATCH',
        url: url,
        data: JSON.stringify(reqData)
      });

      collection.trigger('request', this, req, {});

      req.fail(function(xhr)
      {
        var error = xhr.responseJSON ? xhr.responseJSON.error : null;

        if (!error)
        {
          error = {message: xhr.statusText};
        }

        error.statusCode = xhr.status;

        done(error);

        collection.trigger('error', req);
      });

      req.done(function(res)
      {
        done(null, res);

        collection.trigger('sync', res, req);
      });

      return req;
    },

    applyChanges: function(changes)
    {
      var orders = this;
      var silent = changes.removed.length > 0 || changes.added.length > 0;
      var recountTotals = silent;

      if (!silent)
      {
        for (var i = 0; i < changes.changed.length; ++i)
        {
          if (changes.changed[i].no > 0)
          {
            silent = true;

            break;
          }
        }
      }

      orders.remove(changes.removed, {silent: silent});

      changes.added.forEach(function(added)
      {
        orders.add(PaintShopOrder.parse(added), {silent: silent});
      });

      changes.changed.forEach(function(changed)
      {
        var order = orders.get(changed._id);

        if (!order)
        {
          return;
        }

        order.set(PaintShopOrder.parse(changed), {silent: silent});

        if (changed.qtyPaint || changed.status)
        {
          recountTotals = true;
        }
      });

      if (silent)
      {
        orders.allMrps = null;
        orders.serializedList = null;
        orders.serializedMap = null;
        orders.byOrderNo = null;

        orders.sort({silent: true});
        orders.trigger('reset', orders);
      }
      else if (recountTotals)
      {
        orders.recountTotals();
      }
    }

  }, {

    forDate: function(date, options)
    {
      return new this(null, _.assign({rqlQuery: 'sort(date,no)&limit(0)&date=' + date}, options));
    }

  });
});
