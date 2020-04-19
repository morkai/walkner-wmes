// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhLine'
], function(
  user,
  Collection,
  getShiftStartInfo,
  WhLine
) {
  'use strict';

  return Collection.extend({

    model: WhLine,

    rqlQuery: 'sort(_id)&limit(0)',

    defaults: function()
    {
      return {
        pickup: {
          sets: 0,
          qty: 0,
          time: 0
        },
        components: {
          qty: 0,
          time: 0
        },
        packaging: {
          qty: 0,
          time: 0
        }
      };
    },

    comparator: function(a, b)
    {
      return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
    },

    handleUpdate: function(message)
    {
      if (message.added)
      {
        this.add(message.added);
      }

      if (message.deleted)
      {
        message.deleted.forEach(function(d) { this.remove(d._id); }, this);
      }

      if (message.updated)
      {
        message.updated.forEach(function(d)
        {
          var model = this.get(d._id);

          if (model)
          {
            model.set(d);
          }
        }, this);
      }
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
