// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  function parse(obj)
  {
    var time = Date.parse(obj._id.ts);

    return {
      _id: time + ':' + obj._id.c,
      time: time,
      counter: obj._id.c,
      duration: obj.d,
      reason: obj.r
    };
  }

  return Model.extend({

    urlRoot: '/paintShop/load',

    clientUrlRoot: '#paintShop/load/history',

    privilegePrefix: 'PAINT_SHOP',

    nlsDomain: 'paintShop',

    parse: parse,

    serialize: function(options)
    {
      var obj = this.toJSON();

      obj.time = time.format(obj.time, 'L LTS');
      obj.counter = t(this.nlsDomain, 'load:counters:' + obj.counter);
      obj.duration = time.toString(obj.duration / 1000, false, false);

      if (options && options.reasons && options.reasons.get(obj.reason))
      {
        obj.reason = options.reasons.get(obj.reason).getLabel();
      }

      return obj;
    }

  }, {

    parse: parse

  });
});
