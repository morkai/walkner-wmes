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

    urlRoot: '/componentLabels',

    clientUrlRoot: '#componentLabels',

    topicPrefix: 'componentLabels',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'componentLabels',

    getLabel: function()
    {
      return this.get('description') || (this.get('componentCode') + ', ' + this.get('operationNo'));
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.global = t('core', 'BOOL:' + !!obj.global);
      obj.lines = obj.lines.join('; ');

      return obj;
    }

  }, {

    TEMPLATES: ['32x16', '104x42']

  });
});
