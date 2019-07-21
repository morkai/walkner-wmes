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

    urlRoot: '/drilling/events',

    clientUrlRoot: '#drilling/events',

    privilegePrefix: 'DRILLING',

    nlsDomain: 'wmes-drilling',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.time = time.toTagData(obj.time);
      obj.user = renderUserInfo({userInfo: obj.user, noIp: true});
      obj.comment = obj.data && obj.data.comment || '';

      return obj;
    }

  });
});
