// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/kaizenOrders/dictionaries',
  '../views/engagement/FilterView',
  '../views/engagement/ChartView',
  '../views/engagement/TablesView',
  'app/suggestions/templates/engagement/page'
], function(
  View,
  bindLoadingMessage,
  dictionaries,
  FilterView,
  ChartView,
  TablesView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:reports:base'),
        this.t('BREADCRUMB:reports:engagement')
      ];
    },

    actions: function()
    {
      const page = this;

      return [{
        label: page.t('engagement:export:action'),
        icon: 'download',
        callback: function()
        {
          const btnEl = this.querySelector('.btn');

          btnEl.disabled = true;

          const req = page.ajax({
            type: 'POST',
            url: `/reports;download?filename=${page.t('engagement:export:filename')}`,
            contentType: 'text/csv',
            data: page.model.serializeToCsv()
          });

          req.done(key =>
          {
            window.open(`/reports;download?key=${key}`);
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
      dictionaries.bind(this);

      bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({
        model: this.model
      }));
      this.setView('#-chart', new ChartView({
        model: this.model
      }));
      this.setView('#-tables', new TablesView({
        model: this.model
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    load: function(when)
    {
      return when(
        'app/dataTables',
        'datatables-fixedcolumns',
        this.model.fetch()
      );
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
