// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/pages/FilteredListPage',
  'app/wmes-dummyPaint-jobs/DpJob',
  '../views/FilterView',
  '../views/ListView',
  '../views/StartJobView',
  'app/wmes-dummyPaint-orders/templates/dictionariesAction'
], function(
  viewport,
  FilteredListPage,
  DpJob,
  FilterView,
  ListView,
  StartJobView,
  dictionariesActionTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function()
    {
      var page = this;

      return [
        {
          icon: 'play',
          label: page.t('PAGE_ACTION:startJob'),
          privileges: 'DUMMY_PAINT:WORKER',
          callback: page.showStartJobDialog.bind(page)
        },
        {
          template: function()
          {
            return page.renderPartialHtml(dictionariesActionTemplate);
          },
          privileges: 'DUMMY_PAINT:MANAGE'
        },
        {
          icon: 'cogs',
          label: page.t('PAGE_ACTION:settings'),
          privileges: 'DUMMY_PAINT:MANAGE',
          href: '#dummyPaint/settings'
        }
      ];
    },

    showStartJobDialog: function()
    {
      var dialogView = new StartJobView({
        model: new DpJob()
      });

      viewport.showDialog(dialogView, this.t('startJob:title'));
    }

  });
});
