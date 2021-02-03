// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: [
      {id: 'active', className: 'is-min'},
      {id: 'name'},
      {id: 'mrp', className: 'is-min'}
    ],

    actions: function()
    {
      const viewEditDelete = ListView.actions.viewEditDelete(this.collection);

      return (row) =>
      {
        const actions = viewEditDelete(row);
        const editI = actions.findIndex(a => a.id === 'edit');

        if (editI !== -1)
        {
          actions.splice(editI + 1, 0, {
            id: 'copy',
            icon: 'copy',
            label: this.t('LIST:ACTION:copy'),
            href: `#planning/orderGroups;add?copy=${row._id}`
          });
        }

        return actions;
      };
    }

  });
});
