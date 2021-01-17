// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/Model'
], function(
  _,
  t,
  user,
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
      var componentNames = obj.componentNames || {};

      ['nameInclude', 'nameExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        obj[prop] = '<ul>'
          + obj[prop].map(function(words)
          {
            words = words.map(function(word)
            {
              var result = '<code class="text-mono">' + _.escape(word) + '</code>';

              if (/^[0-9]{12}$/.test(word) && componentNames[word])
              {
                result += ' <small>' + _.escape(componentNames[word]) + '</small>';
              }

              return result;
            });

            return '<li>' + words.join(' ') + '</li>';
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

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('CT:MANAGE:ORDER_GROUPS');
      }

    }

  });
});
