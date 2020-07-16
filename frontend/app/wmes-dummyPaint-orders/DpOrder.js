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

    urlRoot: '/dummyPaint/orders',

    clientUrlRoot: '#dummyPaint/orders',

    topicPrefix: 'dummyPaint.orders',

    privilegePrefix: 'DUMMY_PAINT',

    nlsDomain: 'wmes-dummyPaint-orders',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'L, HH:mm:ss.SSS');
      obj.updatedAt = time.format(obj.updatedAt, 'L, HH:mm:ss.SSS');
      obj.changed = t('core', 'BOOL:' + obj.changed);
      obj.stage = t(this.nlsDomain, 'stage:' + obj.stage);

      return obj;
    },

    serializeRow: function()
    {
      var row = this.serialize();
      var stage = this.get('stage');
      var changed = this.get('changed');
      var error = this.get('error');

      if (error)
      {
        row.className = 'danger';
      }
      else if (stage === 'cancelled')
      {
        row.className = 'warning';
      }
      else if (changed)
      {
        row.className = 'success';
      }

      return row;
    }

  });
});
