// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model'
], function(
  t,
  time,
  user,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/balancing/pces',

    clientUrlRoot: '#ct/balancing/pces',

    topicPrefix: 'ct.balancing.pces',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-balancing',

    getLabel: function()
    {
      return '';
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.startedAt = time.format(obj.startedAt, 'L, HH:mm:ss.SSS');
      obj.finishedAt = time.format(obj.finishedAt, 'L, HH:mm:ss.SSS');

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.order = obj.order._id || '';

      if (obj.order && user.isAllowedTo('ORDERS:VIEW'))
      {
        obj.order = '<a href="#orders/' + obj.order + '">' + obj.order + '</a>';
      }

      obj.d = time.toString(obj.d, false, false);
      obj.stt += '%';

      return obj;
    }

  });
});
