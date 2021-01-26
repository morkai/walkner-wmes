// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/pages/FilteredListPage',
  '../views/FilterView',
  '../views/ListView',
  '../views/ImportDialogView'
], function(
  viewport,
  FilteredListPage,
  FilterView,
  ListView,
  ImportDialogView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    pageClassName: 'page-max-flex',
    baseBreadcrumb: true,

    actions: function()
    {
      const actions = FilteredListPage.prototype.actions.apply(this, arguments);

      actions.unshift({
        icon: 'upload',
        label: this.t('core', 'PAGE_ACTION:import'),
        callback: this.showImportDialog.bind(this)
      });

      return actions;
    },

    showImportDialog: function()
    {
      viewport.showDialog(new ImportDialogView(), this.t('import:title'));
    }

  });
});
