// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model',
  '../data/orgUnits',
  '../data/prodFunctions'
], function(
  t,
  Model,
  orgUnits,
  prodFunctions
) {
  'use strict';

  return Model.extend({

    urlRoot: '/fap/categories',

    clientUrlRoot: '#fap/categories',

    topicPrefix: 'fap.categories',

    privilegePrefix: 'FAP',

    nlsDomain: 'wmes-fap-categories',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.notifications = (obj.notifications || []).map(function(n)
      {
        return {
          subdivisions: n.subdivisions.map(function(id)
          {
            var subdivision = orgUnits.getByTypeAndId('subdivision', id);

            if (!subdivision)
            {
              return id;
            }

            var division = orgUnits.getParent(subdivision);

            return (division ? division.getLabel() : '?') + ' \\ ' + subdivision.getLabel();
          }),
          prodFunctions: n.prodFunctions.map(function(id)
          {
            var prodFunction = prodFunctions.get(id);

            return prodFunction ? prodFunction.getLabel() : id;
          })
        };
      });

      return obj;
    }

  });
});
