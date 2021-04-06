// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/paintShop/events',

    clientUrlRoot: '#paintShop/events',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'paintShop',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.time = time.toTagData(obj.time);
      obj.user = renderUserInfo({userInfo: obj.user, noIp: true});
      obj.comment = obj.data && obj.data.comment || '';
      obj.data = t.flatten(obj.data);

      return obj;
    }

  });
});
