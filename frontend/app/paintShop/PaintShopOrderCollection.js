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

  return Collection.extend({

    model: PaintShopOrder,

    rqlQuery: 'sort(group,no)&limit(0)',

    initialize: function()
    {
      this.selectedMrp = 'all';
      this.allMrps = [];
      this.groups = null;

      this.on('request', function()
      {
        this.allMrps = [];
        this.groups = null;
      });
    },

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(PaintShopOrder.parse);
    },

    genClientUrl: function()
    {
      return '/paintShop/' + (this.isDateFilter('current') ? 'current' : this.getDateFilter());
    },

    isDateFilter: function(expected)
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === expected;
      });
    },

    isDateCurrent: function()
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === 'current';
      });
    },

    getDateFilter: function(format)
    {
      var dateFilter;

      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date' && term.args[1] !== 'current')
        {
          dateFilter = time.getMoment(term.args[1], 'YYYY-MM-DD').format(format || 'YYYY-MM-DD');
        }
      });

      if (!dateFilter)
      {
        dateFilter = this.constructor.getCurrentDate(format);
      }

      return dateFilter;
    },

    setDateFilter: function(newDate)
    {
      var currentDate = this.constructor.getCurrentDate();

      if (newDate === currentDate)
      {
        newDate = 'current';
      }

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

    isVisible: function(order)
    {
      return this.selectedMrp === 'all' || order.get('mrp') === this.selectedMrp;
    },

    serializeGroups: function(filter)
    {
      if (this.groups)
      {
        if (!filter)
        {
          return this.groups;
        }

        return this.groups
          .map(function(group)
          {
            return {
              _id: group._id,
              name: group.name,
              orders: group.orders.filter(filter)
            };
          })
          .filter(function(group)
          {
            return group.orders.length > 0;
          });
      }

      var groupList = [];
      var groupMap = {};
      var mrpMap = {};

      this.forEach(function(order)
      {
        mrpMap[order.get('mrp')] = 1;

        var groupId = order.get('group').replace(/[^A-Za-z0-9]+/g, '');
        var group = groupMap[groupId];

        if (!group)
        {
          group = groupMap[groupId] = {
            _id: groupId,
            name: order.get('group'),
            orders: []
          };

          groupList.push(group);
        }

        group.orders.push(order.serialize());
      });

      if (!mrpMap[this.selectedMrp])
      {
        this.selectedMrp = 'all';
      }

      this.allMrps = Object.keys(mrpMap).sort();
      this.groups = groupList;

      return this.serializeGroups(filter);
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
    }

  }, {

    getCurrentDate: function(format)
    {
      return getShiftStartInfo(Date.now()).moment.format(format || 'YYYY-MM-DD');
    },

    forCurrentDate: function()
    {
      return this.forDate('current');
    },

    forDate: function(date)
    {
      return new this(null, {rqlQuery: 'sort(group,no)&limit(0)&date=' + date});
    }

  });
});
