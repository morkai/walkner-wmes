// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  '../RewardReport',
  '../views/RewardReportFilterView',
  '../views/RewardReportView',
  'app/suggestions/templates/rewardReportPage'
], function(
  View,
  RewardReport,
  RewardReportFilterView,
  RewardReportView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'suggestionRewardReport',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        this.t('BREADCRUMB:reports:reward')
      ];
    },

    actions: function()
    {
      var page = this;

      return [{
        label: page.t('reward:export:action'),
        icon: 'download',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.disabled = true;

          var req = page.ajax({
            type: 'POST',
            url: '/reports;download?filename=' + page.t('reward:export:filename', {
              date: (page.model.get('month') || '0000-00').replace('-', '_')
            }),
            contentType: 'text/csv',
            data: page.model.serializeToCsv()
          });

          req.done(function(key)
          {
            window.open('/reports;download?key=' + key);
          });

          req.always(function()
          {
            btnEl.disabled = false;
          });
        }
      }];
    },

    initialize: function()
    {
      this.defineViews();

      this.setView('#-filter', this.filterView);
      this.setView('#-report', this.reportView);

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    defineViews: function()
    {
      this.filterView = new RewardReportFilterView({
        model: this.model
      });
      this.reportView = new RewardReportView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
