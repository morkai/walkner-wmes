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

    urlRoot: '/planning/whOrderStatuses',

    topicPrefix: 'planning.whOrderStatuses',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    serialize: function()
    {
      return {
        status: this.get('status'),
        label: t('planning', 'wh:status:' + this.get('status'), {
          qtySent: this.get('qtySent')
        })
      };
    }

  });
});
