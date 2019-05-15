// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/trw/tests',

    clientUrlRoot: '#trw/tests',

    topicPrefix: 'trw.tests',

    privilegePrefix: 'TRW',

    nlsDomain: 'wmes-trw-tests',

    getLabel: function()
    {
      return this.get('order') + '/' + this.get('pce');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.duration = time.toString((Date.parse(obj.finishedAt) - Date.parse(obj.startedAt)) / 1000);
      obj.startedAt = time.format(obj.startedAt, 'L, HH:mm:ss');

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.tester = obj.program.base.tester.name;
      obj.base = obj.program.base.name;
      obj.program = obj.program.name;

      return obj;
    }

  });
});
