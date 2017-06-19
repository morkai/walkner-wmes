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

    rqlQuery: 'sort(date)&limit(20)',

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(PaintShopOrder.parse);
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
        dateFilter = getShiftStartInfo(Date.now()).moment.format(format || 'YYYY-MM-DD');
      }

      return dateFilter;
    },

    setDateFilter: function(newDate)
    {
      var currentDate = getShiftStartInfo(Date.now()).moment.format('YYYY-MM-DD');

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

    act: function(reqData, done)
    {
      var collection = this;
      var url = collection.url;

      if (reqData.requestId)
      {
        url = '/isaActiveRequests/' + this.get(reqData.requestId).getProdLineId();
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

    pickup: function(secretKey, done)
    {
      return this.act({action: 'requestPickup', secretKey: secretKey}, done);
    },

    deliver: function(palletKind, secretKey, done)
    {
      return this.act({action: 'requestDelivery', secretKey: secretKey, palletKind: palletKind}, done);
    },

    cancel: function(requestId, secretKey, done)
    {
      return this.act({action: 'cancelRequest', secretKey: secretKey, requestId: requestId}, done);
    },

    accept: function(requestId, responder, done)
    {
      return this.act({action: 'acceptRequest', responder: responder, requestId: requestId}, done);
    },

    finish: function(requestId, done)
    {
      return this.act({action: 'finishRequest', requestId: requestId}, done);
    }

  }, {

    forCurrentDate: function()
    {
      return this.forDate('current');
    },

    forDate: function(date)
    {
      return new this(null, {rqlQuery: 'date=' + date});
    }

  });
});
