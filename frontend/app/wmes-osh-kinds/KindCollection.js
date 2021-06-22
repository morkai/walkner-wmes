// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Kind'
], function(
  Collection,
  Kind
) {
  'use strict';

  return Collection.extend({

    model: Kind,

    comparator: (a, b) => a.get('position') - b.get('position'),

    serialize: function(entryType, current)
    {
      return this
        .filter(kind =>
        {
          if (kind.id === current || (Array.isArray(current) && current.includes(kind.id)))
          {
            return true;
          }

          if (!kind.get('active'))
          {
            return false;
          }

          return !entryType || kind.get('entryTypes').includes(entryType);
        })
        .map(kind => ({
          value: kind.id,
          label: kind.getLabel({long: true}),
          title: kind.get('description'),
          model: kind
        }))
        .sort((a, b) => a.model.get('position') - b.model.get('position'));
    }

  });
});
