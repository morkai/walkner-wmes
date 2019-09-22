// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model'
], function(
  _,
  t,
  time,
  user,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/pces',

    clientUrlRoot: '#ct/pces',

    topicPrefix: 'ct.pces',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-pces',

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

      obj.duration = time.toString(obj.durations.total / 1000, false, false);

      return obj;
    }

  });
});
