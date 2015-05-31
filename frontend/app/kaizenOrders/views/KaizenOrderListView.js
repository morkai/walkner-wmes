// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  function prepareTdAttrs(row)
  {
    /*jshint validthis:true*/

    return row.observer.notify && row.observer.changes && row.observer.changes[this.id] ? 'class="is-changed"' : '';
  }

  return ListView.extend({

    className: 'kaizenOrders-list is-clickable',

    columns: [
      {id: 'rid', className: 'is-min is-number'},
      'types',
      {id: 'status', tdAttrs: prepareTdAttrs},
      {id: 'subject', tdAttrs: prepareTdAttrs},
      {id: 'eventDate', tdAttrs: prepareTdAttrs},
      {id: 'area', tdAttrs: prepareTdAttrs},
      {id: 'cause', tdAttrs: prepareTdAttrs},
      {id: 'risk', tdAttrs: prepareTdAttrs},
      {id: 'nearMissCategory', tdAttrs: prepareTdAttrs},
      {id: 'suggestionCategory', tdAttrs: prepareTdAttrs},
      {id: 'section', tdAttrs: prepareTdAttrs},
      {id: 'confirmer', tdAttrs: prepareTdAttrs},
      'creator'
    ],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
