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

    urlRoot: '/luma2/events',

    clientUrlRoot: '#luma2/events',

    topicPrefix: 'luma2.events',

    privilegePrefix: 'LUMA2',

    nlsDomain: 'wmes-luma2-events',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.type = t(this.nlsDomain, 'type:' + obj.type);
      obj.time = time.format(obj.time, 'L, HH:mm:ss.SSS');

      return obj;
    }

  });
});
