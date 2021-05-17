// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  './dictionaries'
], function(
  t,
  time,
  currentUser,
  Model,
  dictionaries
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

      if (t.has(this.nlsDomain, 'error:' + obj.error))
      {
        var suffix = '';

        if (obj.error === 'NO_PAINT' && currentUser.isAllowedTo('DUMMY_PAINT:MANAGE'))
        {
          suffix = ' <a href="javascript:void(0)" data-action="addPaint">'
            + '<i class="fa fa-plus"></i> '
            + t(this.nlsDomain, 'addPaint:action')
            + '</a>';
        }

        obj.error = t(this.nlsDomain, 'error:' + obj.error) + suffix;
      }

      var code = dictionaries.codes.get(obj.dummyNc12);

      if (code)
      {
        obj.dummyFamily = code.getLabel();
      }

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

      if (row.salesItem)
      {
        row.salesNo += '/' + row.salesItem;
      }

      return row;
    }

  });
});
