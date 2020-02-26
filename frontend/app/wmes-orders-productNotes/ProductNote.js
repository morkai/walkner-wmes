// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/productNotes',

    clientUrlRoot: '#productNotes',

    topicPrefix: 'orders.productNotes',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'wmes-orders-productNotes',

    defaults: {
      target: 'docs',
      priority: 'warning'
    },

    getLabel: function()
    {
      var text = this.get('text');

      if (text > 23)
      {
        return text.substring(0, 20) + '...';
      }

      return text;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.target = t(this.nlsDomain, 'target:' + obj.target);

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.nc12 = obj.nc12.join(', ');
      obj.priority = '<span class="label label-' + obj.priority + '" style="display: block; width: 50px">&nbsp;</span>';

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.nc12 = obj.nc12[0] + (obj.nc12.length > 1 ? (' +' + obj.nc12.length - 1) : '');
      obj.priority = '<span class="label label-' + obj.priority + '" style="display: block">&nbsp;</span>';

      return obj;
    },

    serializeForm: function()
    {
      var obj = this.toJSON();

      obj.nc12 = obj.nc12 ? obj.nc12.join(', ') : '';

      return obj;
    }

  }, {

    PRIORITIES: ['default', 'info', 'warning', 'success', 'danger'],
    TARGETS: ['docs', 'ps']

  });
});
