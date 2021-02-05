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

    urlRoot: '/planning/orderGroups',

    clientUrlRoot: '#planning/orderGroups',

    topicPrefix: 'planning.orderGroups',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning-orderGroups',

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

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.mrp = (obj.mrp || []).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.mrp = (obj.mrp || []).map(function(v) { return '<code>' + v + '</code>'; }).join(' ');

      ['productInclude', 'productExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        obj[prop] = '<ul>'
          + obj[prop].map(function(words)
          {
            words = words.map(function(word)
            {
              var result = '<code class="text-mono">' + _.escape(word) + '</code>';

              if (/^[0-9]{12}$/.test(word) && obj.names[word])
              {
                result += ' <small>' + _.escape(obj.names[word]) + '</small>';
              }

              return result;
            });

            return '<li>' + words.join('<br> + ') + '</li>';
          }).join('')
          + '</ul>';
      });

      return obj;
    },

    isNoMatchGroup: function()
    {
      return this.id === '000000000000000000000000';
    },

    isEmptyGroup: function()
    {
      return this.get('productInclude').length === 0
        && this.get('productExclude').length === 0
        && this.get('bomInclude').length === 0
        && this.get('bomExclude').length === 0;
    }

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('PLANNING:MANAGE', 'PLANNING:PLANNER', 'FN:process-engineer');
      },

      edit: function(model)
      {
        return !model.isNoMatchGroup() && (this.can || this).manage();
      },

      delete: function(model)
      {
        return (this.can || this).edit(model);
      }

    }

  });
});
