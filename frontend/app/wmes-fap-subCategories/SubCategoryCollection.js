// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  '../core/Collection',
  './SubCategory'
], function(
  require,
  Collection,
  SubCategory
) {
  'use strict';

  return Collection.extend({

    model: SubCategory,

    rqlQuery: 'sort(parent,name)',

    comparator: function(a, b)
    {
      var aParent = a.attributes.parent;
      var bParent = b.attributes.parent;

      if (aParent === bParent)
      {
        return a.attributes.name.localeCompare(b.attributes.name, undefined, {
          numeric: true,
          ignorePunctuation: true
        });
      }

      var dictionaries = require('app/wmes-fap-entries/dictionaries');

      if (dictionaries)
      {
        var aCategory = dictionaries.categories.get(aParent);
        var bCategory = dictionaries.categories.get(bParent);

        if (aCategory)
        {
          aParent = aCategory.getLabel();
        }

        if (bCategory)
        {
          bParent = bCategory.getLabel();
        }
      }

      return aParent.localeCompare(bParent, undefined, {
        numeric: true,
        ignorePunctuation: true
      });
    }

  });
});
