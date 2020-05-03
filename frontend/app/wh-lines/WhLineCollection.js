// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhLine'
], function(
  _,
  user,
  Collection,
  getShiftStartInfo,
  WhLine
) {
  'use strict';

  var REFRESH_PROPS = ['pickup', 'components', 'packaging', 'redirLine'];

  return Collection.extend({

    model: WhLine,

    rqlQuery: 'sort(_id)&limit(0)',

    comparator: function(a, b)
    {
      return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
    },

    handleUpdate: function(message)
    {
      var collection = this;
      var fetch = false;

      if (message.added)
      {
        collection.add(message.added, {merge: true});
      }

      if (message.deleted)
      {
        message.deleted.forEach(function(d) { collection.remove(d._id); });
      }

      if (message.updated)
      {
        message.updated.forEach(function(d)
        {
          var model = collection.get(d._id);

          if (model)
          {
            model.set(d);
          }
          else if (!fetch && _.intersection(Object.keys(d), REFRESH_PROPS).length)
          {
            fetch = true;
          }
        });
      }

      return fetch ? collection.fetch() : null;
    }

  }, {

    can: {

      redir: function()
      {
        return user.isAllowedTo('WH:MANAGE', 'PLANNING:MANAGE', 'PLANNING:PLANNER');
      }

    }

  });
});
