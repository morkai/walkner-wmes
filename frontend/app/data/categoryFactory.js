// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
