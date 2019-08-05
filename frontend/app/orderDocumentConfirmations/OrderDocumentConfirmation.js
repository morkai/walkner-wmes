// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../user',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  user,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderDocuments/confirmations',

    clientUrlRoot: '#orderDocuments/confirmations',

    privilegePrefix: 'DOCUMENTS',

    nlsDomain: 'orderDocumentConfirmations',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.user = userInfoTemplate({userInfo: obj.user});
      obj.time = time.format(obj.time, 'L, LTS');

      if (user.isAllowedTo('ORDERS:VIEW'))
      {
        obj.orderNo = '<a href="#orders/' + obj.orderNo + '">' + obj.orderNo + '</a>';
      }

      obj.nc15 = '<a href="#orderDocuments/tree?file=' + obj.nc15 + '">' + obj.nc15 + '</a>';

      return obj;
    }

  });
});
