// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/PfepEntryFilterView',
  '../views/PfepEntryListView',
  '../views/ImportDialogView'
], function(
  viewport,
  FilteredListPage,
  pageActions,
  PfepEntryFilterView,
  PfepEntryListView,
  ImportDialogView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: PfepEntryFilterView,
    ListView: PfepEntryListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, collection, false),
        {
          id: 'import',
          icon: 'upload',
          label: this.t('core', 'PAGE_ACTION:import'),
          privileges: 'PFEP:MANAGE',
          callback: this.showImportDialog.bind(this)
        },
        pageActions.add(collection)
      ];
    },

    showImportDialog: function()
    {
      viewport.showDialog(new ImportDialogView(), this.t('import:title'));
    }

  });
});
