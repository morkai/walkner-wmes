// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../core/Collection',
  './IsaRequest'
], function(
  $,
  Collection,
  IsaRequest
) {
  'use strict';

  return Collection.extend({

    model: IsaRequest,

    rqlQuery: 'sort(-requestedAt)&limit(20)',

    parse: function(res)
    {
      return res.collection.map(IsaRequest.parse);
    },

    getFirstPickup: function()
    {
      return this.find(function(d) { return d.get('type') === 'pickup'; });
    },

    getFirstDelivery: function()
    {
      return this.find(function(d) { return d.get('type') === 'delivery'; });
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

    active: function()
    {
      return new this(null, {
        url: '/isaActiveRequests',
        comparator: function(a, b)
        {
          a = a.attributes;
          b = b.attributes;

          if (a.requestedAt === null)
          {
            return 1;
          }

          if (b.requestedAt === null)
          {
            return -1;
          }

          if (a.type !== b.type)
          {
            return a.type === 'delivery' ? -1 : 1;
          }

          return a.requestedAt - b.requestedAt;
        }
      });
    },

    activeForLine: function(prodLineId)
    {
      return new this(null, {url: '/isaActiveRequests/' + prodLineId});
    }

  });
});
