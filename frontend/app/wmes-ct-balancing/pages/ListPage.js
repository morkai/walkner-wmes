// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/wmes-ct-balancing/BalancingPceReport',
  'app/wmes-ct-balancing/views/FilterView',
  'app/wmes-ct-balancing/views/ListView',
  'app/wmes-ct-balancing/views/BalancingPceChartView',
  'app/wmes-ct-balancing/templates/listPage'
], function(
  FilteredListPage,
  pageActions,
  bindLoadingMessage,
  BalancingPceReport,
  FilterView,
  ListView,
  BalancingPceChartView,
  template
) {
  'use strict';

  return FilteredListPage.extend({

    template: template,
    pageClassName: 'page-max-flex',
    baseBreadcrumb: '#ct',

    actions: function(layout)
    {
      return [pageActions.export(layout, this, this.collection)];
    },

    FilterView: FilterView,
    ListView: ListView,

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      this.report = bindLoadingMessage(new BalancingPceReport(), this);

      this.reportView = new BalancingPceChartView({
        model: this.report
      });

      this.setView('.report-container', this.reportView);

      this.listenTo(this.listView, 'added', this.reloadReport);
    },

    load: function(when)
    {
      if (!this.collection.getProductFilter())
      {
        return when();
      }

      return when(
        this.collection.fetch({reset: true}),
        this.report.fetch({rqlQuery: this.collection.rqlQuery})
      );
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.apply(this, arguments);
    },

    onFilterChanged: function()
    {
      FilteredListPage.prototype.onFilterChanged.apply(this, arguments);

      this.reloadReport();
    },

    reloadReport: function()
    {
      this.promised(this.report.fetch({rqlQuery: this.collection.rqlQuery}));
    }

  });
});
