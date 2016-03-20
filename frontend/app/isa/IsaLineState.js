// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model',
  '../data/orgUnits'
], function(
  time,
  Model,
  orgUnits
) {
  'use strict';

  function parse(obj)
  {
    if (typeof obj.updatedAt === 'string')
    {
      obj.updatedAt = new Date(obj.updatedAt);
    }

    if (typeof obj.requestedAt === 'string')
    {
      obj.requestedAt = new Date(obj.requestedAt);
    }

    if (typeof obj.respondedAt === 'string')
    {
      obj.respondedAt = new Date(obj.respondedAt);
    }

    return obj;
  }

  return Model.extend({

    urlRoot: '/isaLineStates',

    topicPrefix: 'isaLineStates',

    privilegePrefix: 'ISA',

    nlsDomain: 'isa',

    initialize: function()
    {
      this.updateOrgUnits();
      this.updateTime();

      this.on('change:requestedAt', this.updateTime.bind(this, false));
    },

    parse: parse,

    updateOrgUnits: function(silent)
    {
      var ou = orgUnits.getAllForProdLine(this.id);

      ou.prodLine = orgUnits.getByTypeAndId('prodLine', ou.prodLine).getLabel()
        .toUpperCase()
        .replace(/(_+|~.*?)$/, '')
        .replace(/_/g, ' ');

      ou.prodFlow = orgUnits.getByTypeAndId('prodFlow', ou.prodFlow).getLabel()
        .replace(/\s+(;|,)/g, '$1');

      this.set('orgUnits', ou, {silent: silent});
    },

    updateTime: function(silent)
    {
      this.set('time', time.toTagData(this.get('requestedAt')), {silent: silent});
    },

    getPalletKind: function()
    {
      var data = this.get('data');

      return data && data.palletKind || {
        id: '',
        label: ''
      };
    },

    getWhman: function()
    {
      return this.get('responder') || {
        id: '',
        label: '?'
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.palletKind = this.getPalletKind().label;
      obj.whman = this.getWhman().label;

      return obj;
    },

    matchResponder: function(requiredResponder)
    {
      if (!requiredResponder)
      {
        return true;
      }

      var actualResponder = this.get('responder');

      return actualResponder && actualResponder.id === requiredResponder.id;
    },

    act: function(reqData, done)
    {
      var lineState = this;
      var req = lineState.sync('patch', lineState, {attrs: reqData});

      req.fail(function(xhr)
      {
        var error = xhr.responseJSON ? xhr.responseJSON.error : null;

        if (!error)
        {
          error = {message: xhr.statusText};
        }

        error.statusCode = xhr.status;

        done(error);

        lineState.trigger('error');
      });

      req.done(function(res)
      {
        done(null, res);

        lineState.trigger('sync');
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

    cancel: function(secretKey, done)
    {
      return this.act({action: 'cancelRequest', secretKey: secretKey}, done);
    },

    accept: function(responder, done)
    {
      return this.act({action: 'acceptRequest', responder: responder}, done);
    },

    finish: function(done)
    {
      return this.act({action: 'finishRequest'}, done);
    }

  }, {

    parse: parse

  });
});
