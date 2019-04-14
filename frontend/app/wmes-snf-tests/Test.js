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

    urlRoot: '/snf/tests',

    clientUrlRoot: '#snf/tests',

    topicPrefix: 'snf.tests',

    privilegePrefix: 'SNF',

    nlsDomain: 'wmes-snf-tests',

    getLabel: function()
    {
      return (this.get('orderNo') || '?') + '/' + (this.get('serialNo') || '?');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.duration = time.toString((Date.parse(obj.finishedAt) - Date.parse(obj.startedAt)) / 1000);
      obj.startedAt = time.format(obj.startedAt, 'L, HH:mm:ss');
      obj.finishedAt = time.format(obj.finishedAt, 'L, HH:mm:ss');
      obj.orderNo = obj.orderNo || '';
      obj.serialNo = obj.serialNo || '';

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.className = obj.result ? 'success' : 'danger';
      obj.program = obj.program.name;

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.program = obj.program.name;

      return obj;
    }

  });
});
