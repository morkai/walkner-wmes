// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Station'
], function(
  Collection,
  Station
) {
  'use strict';

  return Collection.extend({

    model: Station,

    comparator: (a, b) => a.get('shortName').localeCompare(b.get('shortName'), undefined, {
      ignorePunctuation: true,
      numeric: true
    }),

    initialize: function()
    {
      Collection.prototype.initialize.apply(this, arguments);

      this.cache = null;

      this.on('reset add remove change:location', () => this.cache = null);
    },

    getByLocation: function(locationId)
    {
      if (!this.cache)
      {
        this.cache = {};

        this.forEach(station =>
        {
          const location = station.get('location');

          if (!this.cache[location])
          {
            this.cache[location] = [];
          }

          this.cache[location].push(station);
        });
      }

      if (!this.cache[locationId])
      {
        this.cache[locationId] = [];
      }

      return this.cache[locationId];
    }

  });
});
