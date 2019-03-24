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

    urlRoot: '/luma2/lines',

    clientUrlRoot: '#luma2/lines',

    topicPrefix: 'luma2.lines',

    privilegePrefix: 'LUMA2:MANAGE',

    nlsDomain: 'wmes-luma2-lines',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    }

  });
});
