// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model'
], function(
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/luca/events',

    clientUrlRoot: '#luca/events',

    topicPrefix: 'luca.events',

    privilegePrefix: 'LUCA',

    nlsDomain: 'wmes-luca-events',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.type = t(this.nlsDomain, 'type:' + obj.type);
      obj.time = time.format(obj.time, 'L, HH:mm:ss.SSS');

      return obj;
    }

  });
});
