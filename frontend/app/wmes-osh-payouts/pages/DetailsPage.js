// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/wmes-osh-common/dictionaries',
  '../views/DetailsView',
  '../views/PrintDialogView'
], function(
  viewport,
  DetailsPage,
  pageActions,
  dictionaries,
  DetailsView,
  PrintDialogView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView,

    pageClassName: 'page-max-flex',

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports'),
        {
          href: '#osh/reports/rewards',
          label: this.t('BREADCRUMB:base')
        },
        {
          href: '#osh/payouts',
          label: this.t('BREADCRUMB:browse')
        },
        this.t('BREADCRUMB:details')
      ];
    },

    actions: function()
    {
      return [{
        icon: 'print',
        label: this.t('core', 'PAGE_ACTION:print'),
        callback: this.print.bind(this)
      }, {
        icon: 'download',
        label: this.t('core', 'PAGE_ACTION:export'),
        callback: this.export.bind(this)
      }];
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    },

    print: function()
    {
      const dialogView = new PrintDialogView({
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('printDialog:title'));
    },

    export: function()
    {
      pageActions.exportXlsx(`/osh/payouts;export.xlsx?_id=${this.model.id}`);
    }

  });
});
