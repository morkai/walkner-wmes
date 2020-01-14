// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/kaizenOrders/dictionaries',
  '../SuggestionEngagementReport',
  '../views/SuggestionEngagementReportFilterView',
  '../views/SuggestionEngagementReportView',
  'app/suggestions/templates/engagementReportPage'
], function(
  t,
  View,
  kaizenDictionaries,
  SuggestionEngagementReport,
  SuggestionEngagementReportFilterView,
  SuggestionEngagementReportView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'suggestionEngagementReport',

    template: template,

    breadcrumbs: function()
    {
      return [
        t.bound(this.options.baseBreadcrumbNls || 'suggestions', 'BREADCRUMB:base'),
        t.bound('suggestions', 'BREADCRUMB:reports:engagement')
      ];
    },

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('suggestions', 'engagement:export:action'),
        icon: 'download',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.disabled = true;

          var req = page.ajax({
            type: 'POST',
            url: '/reports;download?filename=' + t('suggestions', 'engagement:export:filename'),
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

      this.setView('#' + this.idPrefix + '-filter', this.filterView);
      this.setView('#' + this.idPrefix + '-report', this.reportView);

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    defineViews: function()
    {
      this.filterView = new SuggestionEngagementReportFilterView({
        model: this.model
      });
      this.reportView = new SuggestionEngagementReportView({
        model: this.model
      });
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
    },

    load: function(when)
    {
      if (kaizenDictionaries.loaded)
      {
        return when(this.model.fetch());
      }

      return kaizenDictionaries.load().then(this.model.fetch.bind(this.model));
    },

    afterRender: function()
    {
      kaizenDictionaries.load();
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
