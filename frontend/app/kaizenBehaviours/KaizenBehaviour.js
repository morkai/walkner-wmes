// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Model'
], function(
  user,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/behaviours',

    clientUrlRoot: '#kaizenBehaviours',

    topicPrefix: 'kaizen.behaviours',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenBehaviours',

    labelAttribute: '_id',

    defaults: {},

    getLabel: function()
    {
      return this.t('name');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.name = this.t('name');
      obj.description = this.t('description');

      return obj;
    },

    t: function(prop)
    {
      var lang = this.attributes.lang;

      if (lang[user.lang] && lang[user.lang][prop] != null)
      {
        return lang[user.lang][prop];
      }

      lang = lang[Object.keys(user.lang)[0]];

      return lang && lang[prop] != null ? lang[prop] : null;
    }

  });
});
