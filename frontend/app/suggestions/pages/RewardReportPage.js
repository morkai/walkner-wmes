// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../RewardReport',
  '../views/RewardReportFilterView',
  '../views/RewardReportView',
  'app/suggestions/templates/rewardReportPage'
], function(
  View,
  dictionaries,
  RewardReport,
  RewardReportFilterView,
  RewardReportView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports:base'),
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
      }, {
        label: this.t('PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'KAIZEN:DICTIONARIES:MANAGE',
        href: '#kaizenOrders;settings?tab=reward'
      }];
    },

    initialize: function()
    {
      dictionaries.bind(this);

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
