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
      partial: 0,
      finished: 0,
      cancelled: 0
    };
  }

  return Collection.extend({

    model: PaintShopOrder,

    comparator: 'no',

    initialize: function(models, options)
    {
      this.settings = options ? options.settings : null;
      this.paints = options ? options.paints : null;
      this.dropZones = options ? options.dropZones : null;
      this.selectedMrp = options && options.selectedMrp ? options.selectedMrp : 'all';
      this.selectedPaint = options && options.selectedPaint ? options.selectedPaint : 'all';

      this.allMrps = null;
      this.serializedList = null;
      this.serializedMap = null;
      this.totalQuantities = {};

      this.on('request', function()
      {
        this.serializedList = null;
        this.serializedMap = null;
      });

      this.on('change', function(order)
      {
        if (this.serializedMap && this.serializedMap[order.id])
        {
          _.assign(this.serializedMap[order.id], order.serialize(true, this.paints, this));
        }
      });
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
      return this.selectedMrp === 'all' || serializedOrder.mrp === this.selectedMrp;
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

    getChildOrderDropZoneClass: function(childOrder)
    {
      if (!this.dropZones || !this.settings)
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
      var mrpMap = {};
      var totalQuantities = {
        all: createEmptyTotals()
      };

      orders.forEach(function(order)
      {
        var serializedOrder = serializedMap[order.id] = order.serialize(true, orders.paints, orders);

        serializedList.push(serializedOrder);

        mrpMap[serializedOrder.mrp] = 1;

        orders.recountOrder(totalQuantities, serializedOrder);
      });

      orders.serializedList = serializedList;
      orders.serializedMap = serializedMap;
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

      this.serializedList.forEach(this.recountOrder.bind(this, this.totalQuantities));

      this.trigger('totalsRecounted');
    },

    recountOrder: function(totalQuantities, order)
    {
      var mrp = order.mrp;
      var status = order.status;
      var qtyPaint = order.qtyPaint;

      if (!totalQuantities[mrp])
      {
        totalQuantities[mrp] = createEmptyTotals();
      }

      totalQuantities.all[status] += qtyPaint;
      totalQuantities[mrp][status] += qtyPaint;

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
