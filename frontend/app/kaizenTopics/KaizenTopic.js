// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/topics',

    clientUrlRoot: '#kaizenTopics',

    topicPrefix: 'kaizen.topics',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenTopics',

    labelAttribute: 'shortName',

    serialize: function()
    {
      var o = this.toJSON();

      o.active = t('core', 'BOOL:' + o.active);

      return o;
    },

    getLabel: function(options)
    {
      return this.get(options && options.short === false ? 'fullName' : 'shortName');
    }

  });
});
