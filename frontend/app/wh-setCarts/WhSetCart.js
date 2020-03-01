// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  t,
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/setCarts',

    clientUrlRoot: '#wh/setCarts',

    topicPrefix: 'old.wh.setCarts',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-setCarts',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = obj.status === 'delivering' ? 'info' : obj.status === 'delivered' ? 'success' : '';
      obj.status = t(this.nlsDomain, 'status:' + obj.status);
      obj.kind = t(this.nlsDomain, 'kind:' + obj.kind);
      obj.date = time.format(obj.date, 'L');
      obj.orders = obj.orders.map(function(o) { return o.sapOrder; }).join('; ');
      obj.completedAt = time.format(obj.completedAt, 'L LT');
      obj.duration = obj.deliveredAt && obj.deliveringAt
        ? time.toStirng((Date.parse(obj.deliveredAt) - Date.parse(obj.deliveringAt)) / 1000, false, false)
        : '';
      obj.deliveringAt = obj.deliveringAt ? time.format(obj.deliveringAt, 'L LT') : '';
      obj.deliveredAt = obj.deliveredAt ? time.format(obj.deliveredAt, 'L LT') : '';
      obj.completedBy = obj.completedBy
        .map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); })
        .join('; ');
      obj.deliveringBy = userInfoTemplate({userInfo: obj.deliveringBy});
      obj.deliveredBy = userInfoTemplate({userInfo: obj.deliveredBy});

      return obj;
    }

  }, {

    STATUSES: ['completed', 'delivering', 'delivered'],
    KINDS: ['components', 'packaging']

  });
});
