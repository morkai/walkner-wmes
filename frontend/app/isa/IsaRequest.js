// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  '../data/orgUnits',
  '../data/isaPalletKinds',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  Model,
  orgUnits,
  palletKinds,
  renderUserInfo
) {
  'use strict';

  var STATUS_TO_SEVERITY_CLASS_NAME = {
    new: 'debug',
    accepted: 'warning',
    finished: 'success',
    cancelled: 'danger'
  };

  function getProdLineId(orgUnits)
  {
    var last = _.last(orgUnits);

    if (last && last.type === 'prodLine')
    {
      return last.id;
    }

    var line = _.find(orgUnits, function(orgUnit) { return orgUnit.type === 'prodLine'; });

    return line ? line.id : null;
  }

  function parse(obj)
  {
    ['requestedAt', 'respondedAt', 'finishedAt'].forEach(function(prop)
    {
      if (typeof obj[prop] === 'string')
      {
        obj[prop] = new Date(obj[prop]);
      }
    });

    if (obj.orgUnits && !obj.orgUnit)
    {
      var prodLineId = getProdLineId(obj.orgUnits);
      var orgUnit = orgUnits.getAllForProdLine(prodLineId);
      var prodLine = orgUnits.getByTypeAndId('prodLine', orgUnit.prodLine);
      var prodFlow = orgUnits.getByTypeAndId('prodFlow', orgUnit.prodFlow);

      orgUnit.prodLine = !prodLine ? prodLineId : orgUnits.getByTypeAndId('prodLine', orgUnit.prodLine).getLabel()
        .toUpperCase()
        .replace(/(_+|~.*?)$/, '')
        .replace(/_/g, ' ');

      orgUnit.prodFlow = !prodFlow ? '?' : prodFlow.getLabel()
        .replace(/\s+(;|,)/g, '$1');

      obj.orgUnit = orgUnit;
    }

    return obj;
  }

  return Model.extend({

    urlRoot: '/isaRequests',

    clientUrlRoot: '#isa/requests',

    topicPrefix: 'isaRequests',

    privilegePrefix: 'ISA',

    nlsDomain: 'isa',

    parse: parse,

    initialize: function()
    {
      this.updateOrgUnits();
      this.updateTime();
    },

    updateOrgUnits: function(silent)
    {
      var ou = orgUnits.getAllForProdLine(this.getProdLineId());
      var prodLine = orgUnits.getByTypeAndId('prodLine', ou.prodLine);
      var prodFlow = orgUnits.getByTypeAndId('prodFlow', ou.prodFlow);

      ou.prodLine = (prodLine ? prodLine.getLabel() : this.getProdLineId())
        .toUpperCase()
        .replace(/(_+|~.*?)$/, '')
        .replace(/_/g, ' ');

      ou.prodFlow = prodFlow ? prodFlow.getLabel().replace(/\s+(;|,)/g, '$1') : '?';

      this.set('orgUnit', ou, {silent: silent});
    },

    updateTime: function(silent)
    {
      this.set('time', time.toTagData(this.get('requestedAt'), true), {silent: silent});
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.qty = this.getQty();
      obj.palletKind = this.getPalletKind().label;
      obj.palletKindFull = this.getFullPalletKind();
      obj.whman = this.getWhman().label;

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_TO_SEVERITY_CLASS_NAME[obj.status];
      obj.line = this.getProdLineId();
      obj.type = t('isa', 'requests:type:' + obj.type, {
        qty: obj.data.qty || 8,
        palletKind: obj.data.palletKind ? obj.data.palletKind.label : '?'
      });
      obj.status = t('isa', 'requests:status:' + obj.status);
      obj.requester = renderUserInfo({userInfo: obj.requester});
      obj.responder = renderUserInfo({userInfo: obj.responder});
      obj.finisher = renderUserInfo({userInfo: obj.finisher});
      obj.requestedAt = time.format(obj.requestedAt, 'LL, LTS');
      obj.respondedAt = obj.respondedAt ? time.format(obj.respondedAt, 'LTS') : '-';
      obj.finishedAt = obj.finishedAt ? time.format(obj.finishedAt, 'LTS') : '-';
      obj.duration = time.toString(this.getDuration());
      obj.request = t('isa', 'requests:date+user', {
        date: obj.requestedAt,
        user: obj.requester
      });
      obj.response = obj.respondedAt === '-' ? '-' : t('isa', 'requests:time+user', {
        time: obj.respondedAt,
        user: obj.responder
      });
      obj.finish = obj.finishedAt === '-' ? '-' : t('isa', 'requests:time+user', {
        time: obj.finishedAt,
        user: obj.finisher
      });

      return obj;
    },

    getProdLineId: function()
    {
      return getProdLineId(this.get('orgUnits'));
    },

    getPalletKind: function()
    {
      var data = this.get('data');

      return data && data.palletKind || {
        id: '',
        label: ''
      };
    },

    getQty: function()
    {
      var data = this.get('data');

      return data && data.qty || 8;
    },

    getFullPalletKind: function()
    {
      var palletKindInfo = this.getPalletKind();
      var palletKindModel = palletKinds.get(palletKindInfo.id);

      return palletKindModel ? palletKindModel.get('fullName') : '?';
    },

    getWhman: function()
    {
      return this.get('responder') || {
        id: '',
        label: '?'
      };
    },

    isCompleted: function()
    {
      return this.get('status') === 'finished' || this.get('status') === 'cancelled';
    },

    getDuration: function()
    {
      if (this.isCompleted())
      {
        return this.get('duration');
      }

      return (Date.now() - Date.parse(this.get('requestedAt'))) / 1000;
    },

    matchResponder: function(requiredResponder)
    {
      if (!requiredResponder)
      {
        return true;
      }

      var actualResponder = this.get('responder');

      return actualResponder && actualResponder.id === requiredResponder.id;
    }

  }, {

    parse: parse

  });
});
