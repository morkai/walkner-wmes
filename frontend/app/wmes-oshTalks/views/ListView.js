// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    serializeColumns: function()
    {
      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'date', className: 'is-min'},
        {id: 'auditor', className: 'is-min'},
        {id: 'section', className: 'is-min'},
        {id: 'topics', className: 'is-min'},
        {id: 'participants', className: 'is-min'},
        '-'
      ];
    }

  });
});
