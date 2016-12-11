// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      obj.lastSeenAt = time.format(obj.connectedAt || obj.disconnectedAt, 'L, LTS');
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
