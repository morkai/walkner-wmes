// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/time',
  'app/core/Model'
], function(
  require,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/employments',

    clientUrlRoot: '#osh/employments',

    topicPrefix: 'osh.employments',

    privilegePrefix: 'OSH:HR',

    nlsDomain: 'wmes-osh-employments',

    getLabel: function()
    {
      return time.utc.format(this.id, 'MMMM YYYY');
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.month = time.utc.format(obj._id, 'MMMM YYYY');

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.count = 0;

      obj.divisions.forEach(({count}) => obj.count += count);

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();
      const workplaces = new Map();

      obj.divisions.forEach(d =>
      {
        if (!workplaces.has(d.workplace))
        {
          workplaces.set(d.workplace, {
            label: dictionaries.getLabel('workplaces', d.workplace),
            divisions: []
          });
        }

        workplaces.get(d.workplace).divisions.push({
          label: dictionaries.getLabel('divisions', d.division),
          count: d.count
        });
      });

      obj.workplaces = Array.from(workplaces.values());

      return obj;
    }

  });
});
