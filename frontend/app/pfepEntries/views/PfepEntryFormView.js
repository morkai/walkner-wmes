// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  '../dictionaries',
  'app/pfepEntries/templates/form'
], function(
  _,
  FormView,
  dictionaries,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'change #-unit': function(e)
      {
        var unit = e.target.value.toLowerCase().trim();

        if (unit === 'pcs' || unit === 'szt')
        {
          unit = 'pce';
        }

        e.target.value = unit;
      },

      'change #-packType': function(e)
      {
        var packType = e.target.value.toLowerCase().trim();

        if (/ipp/.test(packType))
        {
          packType = 'ipp pallet';
        }
        else if (/^pall?eta?$/.test(packType))
        {
          packType = 'pallet';
        }
        else if (/(carton|car[td]board)/.test(packType))
        {
          packType = 'cardboard box';
        }
        else if (/^bo[xs]$/.test(packType))
        {
          packType = 'box';
        }
        else if (/undle$/.test(packType))
        {
          packType = 'bundle';
        }

        e.target.value = packType;
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        packTypes: dictionaries.packTypes,
        units: dictionaries.units,
        vendors: dictionaries.vendors
      };
    }

  });
});
