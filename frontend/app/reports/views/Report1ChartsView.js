define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  './Report1CoeffsChartView',
  './Report1DowntimesChartView',
  'app/reports/templates/report1Charts'
], function(
  _,
  $,
  t,
  View,
  renderOrgUnitPath,
  Report1CoeffsChartView,
  Report1DowntimesChartView,
  report1ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report1ChartsTemplate,

    initialize: function()
    {
      window.model = this.model;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);

      this.setView(
        '.reports-1-coeffs-container',
        new Report1CoeffsChartView({
          model: this.model,
          orgUnit: this.options.orgUnit
        })
      );

      this.setView(
        '.reports-1-downtimesByAor-container',
        new Report1DowntimesChartView({
          model: this.model,
          orgUnit: this.options.orgUnit,
          attrName: 'downtimesByAor'
        })
      );

      this.setView(
        '.reports-1-downtimesByReason-container',
        new Report1DowntimesChartView({
          model: this.model,
          orgUnit: this.options.orgUnit,
          attrName: 'downtimesByReason'
        })
      );
    },

    destroy: function()
    {

    },

    serialize: function()
    {
      var orgUnit = this.model.get('orgUnit');

      return {
        title: orgUnit
          ? renderOrgUnitPath(orgUnit, false, false)
          : t('reports', 'report1:overallTitle')
      };
    },

    beforeRender: function()
    {

    },

    afterRender: function()
    {
      this.promised(this.model.fetch());
    },

    onModelLoading: function()
    {
      this.$('.reports-panel-body').addClass('reports-loading');
    },

    onModelLoaded: function()
    {
      this.$('.reports-panel-body').removeClass('reports-loading');
    },

    onModelError: function()
    {
      this.$('.reports-panel-body')
        .removeClass('reports-loading')
        .addClass('reports-loadingFailed');
    }

  });
});
