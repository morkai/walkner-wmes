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

    parse: function(res)
    {
      res._id = time.utc.format(res._id, 'YYYY-MM-DD');

      return res;
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

      obj.departments.forEach(({count}) => obj.count += count);

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();
      const workplaces = new Map();

      obj.departments.forEach(d =>
      {
        if (!workplaces.has(d.workplace))
        {
          workplaces.set(d.workplace, {
            label: dictionaries.getLabel('workplaces', d.workplace),
            departments: []
          });
        }

        workplaces.get(d.workplace).departments.push({
          label: dictionaries.getLabel('departments', d.department),
          count: d.count
        });
      });

      obj.workplaces = Array.from(workplaces.values());

      obj.workplaces.sort((a, b) => a.label.localeCompare(b.label));

      obj.workplaces.forEach(workplace =>
      {
        workplace.departments.sort((a, b) => a.label.localeCompare(b.label));
      });

      return obj;
    }

  });
});
