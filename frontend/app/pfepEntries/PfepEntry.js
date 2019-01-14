// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../i18n',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  user,
  t,
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/pfep/entries',

    clientUrlRoot: '#pfep/entries',

    topicPrefix: 'pfep.entries',

    privilegePrefix: 'PFEP',

    nlsDomain: 'pfepEntries',

    labelAttribute: 'rid',

    defaults: {
      externalPackQty: 0,
      internalPackQty: 0,
      packLength: 0,
      packWidth: 0,
      packHeight: 0,
      packGrossWeight: 0,
      componentNetWeight: 0,
      componentGrossWeight: 0,
      qtyPerLayer: 0,
      qtyOnPallet: 0,
      palletLength: 0,
      palletWidth: 0,
      palletHeight: 0,
      moq: 0,
      roundingValue: 0
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.date = time.format(obj.createdAt, 'L');
      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = renderUserInfo({userInfo: obj.creator, noIp: true});
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');
      obj.updater = renderUserInfo({userInfo: obj.updater});
      obj.packSize = obj.packLength + ' x ' + obj.packWidth + ' x ' + obj.packHeight;
      obj.palletSize = obj.palletLength + ' x ' + obj.palletWidth + ' x ' + obj.palletHeight;

      Object.keys(this.defaults).forEach(function(prop)
      {
        obj[prop] = obj[prop].toLocaleString();
      });

      return obj;
    }

  });
});
