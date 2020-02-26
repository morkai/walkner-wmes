// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../core/Model'
], function(
  _,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/orderGroups',

    clientUrlRoot: '#ct/orderGroups',

    topicPrefix: 'ct.orderGroups',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-orderGroups',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        active: true
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      ['nameInclude', 'nameExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        obj[prop] = '<ul>'
          + obj[prop].map(function(words)
          {
            return '<li>'
              + words.map(function(word) { return '<code class="text-mono">' + _.escape(word) + '</code>'; }).join(' ')
              + '</li>';
          }).join('')
          + '</ul>';
      });

      ['nc12Include', 'nc12Exclude'].forEach(function(prop)
      {
        obj[prop] = obj[prop]
          .map(function(word)
          {
            return '<code class="text-mono">' + _.escape(word) + '</code>';
          })
          .join(' ');
      });

      return obj;
    }

  });
});