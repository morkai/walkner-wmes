// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model'
], function(
  _,
  time,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderDocuments/clients',

    clientUrlRoot: '#orderDocuments/clients',

    privilegePrefix: 'DOCUMENTS',

    nlsDomain: 'orderDocumentClients',

    serialize: function()
    {
      var obj = this.toJSON();
      var orderInfo = obj.orderInfo || {};

      obj.className = obj.connectedAt ? 'success' : 'danger';
      obj.lastSeenAt = time.format(obj.connectedAt || obj.disconnectedAt, 'YY-MM-DD, HH:mm:ss');
      obj.fileSource = orderInfo.fileSource ? t('orderDocumentClients', 'fileSource:' + orderInfo.fileSource) : '-';

      if (orderInfo.orderNo)
      {
        obj.orderNo = '<a href="#orders/' + orderInfo.orderNo + '">' + orderInfo.orderNo + '</a>';
        obj.orderNc12 = orderInfo.orderNc12;
        obj.orderName = orderInfo.orderName;
      }

      var nc15 = orderInfo.documentNc15;

      if (nc15)
      {
        obj.documentNc15 = nc15.length !== 15
          ? nc15
          : ('<a href="/orderDocuments/' + nc15 + '" target=_blank>' + nc15 + '</a>');
        obj.documentName = orderInfo.documentName;
      }

      return obj;
    }

  });

});
