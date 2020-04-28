// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-ct-state/settings',
  '../ResultsReport',
  '../views/resultsReport/FilterView',
  '../views/resultsReport/VsChartView',
  '../views/resultsReport/AvgOutputChartView',
  '../views/resultsReport/TableView',
  '../views/resultsReport/UpphQuarterlyConfigView',
  'app/wmes-ct-pces/templates/resultsReport/page'
], function(
  _,
  t,
  viewport,
  View,
  bindLoadingMessage,
  settings,
  ResultsReport,
  FilterView,
  VsChartView,
  AvgOutputChartView,
  TableView,
  UpphQuarterlyConfigView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    events: {
      'click #-editUpphConfig': function()
      {
        var dialogView = new UpphQuarterlyConfigView();

        viewport.showDialog(dialogView, this.t('upphQuarterlyConfig:title'));
      },
      'click .ct-reports-results-mode': function(e)
      {
        this.model.set(e.currentTarget.dataset.prop, e.currentTarget.dataset.value);
      }
    },

    breadcrumbs: function()
    {
      return [
        {href: '#ct', label: this.t('BREADCRUMB:base')},
        this.t('BREADCRUMB:reports:results')
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PROD_DATA:MANAGE',
          href: '#ct/settings?tab=resultsReport'
        }
      ];
    },

    initialize: function()
    {
      settings.bind(this);

      this.model = bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({
        model: this.model,
        settings: this.settings
      }));
      this.setView('#-vs', new VsChartView({model: this.model}));
      this.setView('#-avgOutput', new AvgOutputChartView({model: this.model}));
      this.setView('#-table', new TableView({model: this.model}));

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:tab', this.updateUrl);
      this.listenTo(this.model, 'change:upph', this.onUpphChanged);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    getTemplateData: function()
    {
      return {
        canManage: ResultsReport.can.manage()
      };
    },

    afterRender: function()
    {
      this.updateUpphMode();
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());
      this.updateUrl();
    },

    onUpphChanged: function()
    {
      this.updateUpphMode();
      this.updateUrl();
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    updateUpphMode: function()
    {
      this.$('.active[data-prop]').removeClass('active');
      this.$('.ct-reports-results-mode[data-value="' + this.model.get('upph') + '"]').addClass('active');
    }

  });
});
