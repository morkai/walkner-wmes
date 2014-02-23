define(function()
{
  'use strict';

  var groups = {};

  return {
    getCategory: function(group, key)
    {
      if (typeof groups[group] === 'undefined')
      {
        groups[group] = {
          counter: 0,
          assigned: {}
        };
      }

      group = groups[group];

      if (typeof group.assigned[key] !== 'string')
      {
        group.assigned[key] = group.counter.toString(36).toUpperCase();
        group.counter += 1;
      }

      return group.assigned[key];
    }
  };
});
