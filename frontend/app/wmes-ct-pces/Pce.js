// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/pces',

    clientUrlRoot: '#ct/pces',

    topicPrefix: 'ct.pces',

    privilegePrefix: 'CT',

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

      obj.order = obj.order._id;
      obj.duration = time.toString(obj.durations.total / 1000, false, false);

      return obj;
    }

  });
});
