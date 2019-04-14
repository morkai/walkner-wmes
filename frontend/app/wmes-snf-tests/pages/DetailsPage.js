// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/core/views/DetailsView',
  'app/wmes-snf-programs/Program',
  'app/wmes-snf-programs/views/DetailsView',
  '../Test',
  '../views/ChartsView',
  'app/wmes-snf-tests/templates/detailsPage',
  'app/wmes-snf-tests/templates/details'
], function(
  t,
  time,
  bindLoadingMessage,
  DetailsPage,
  DetailsView,
  Program,
  ProgramDetailsView,
  Test,
  TestChartsView,
  detailsPageTemplate,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,
    pageClassName: 'page-max-flex',
    template: detailsPageTemplate,

    actions: [],

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model, 'change:program', function()
      {
        this.programView.model.set(this.model.get('program'));
      });

      this.setView('#-details', this.detailsView);
      this.setView('#-program', this.programView);
      this.setView('#-charts', this.chartsView);
    },

    defineViews: function()
    {
      this.detailsView = new DetailsView({
        template: detailsTemplate,
        model: this.model
      });

      this.programView = new ProgramDetailsView({
        model: new Program()
      });

      this.chartsView = new TestChartsView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
