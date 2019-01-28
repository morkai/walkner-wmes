// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/opinionSurveys/templates/npsTable'
], function(
  _,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model.report, 'change:npsResponses', this.render);
    },

    getTemplateData: function()
    {
      var report = this.model.report;
      var total = report.get('npsTotal') || 0;
      var detractors = report.get('npsDetractors') || 0;
      var neutral = report.get('npsNeutral') || 0;
      var promoters = report.get('npsPromoters') || 0;
      var templateData = {
        absolute: {
          total: total,
          detractors: detractors,
          neutral: neutral,
          promoters: promoters,
          score: promoters - detractors
        },
        percent: {
          total: 100,
          detractors: Math.round((detractors / total) * 100) || 0,
          neutral: Math.round((neutral / total) * 100) || 0,
          promoters: Math.round((promoters / total) * 100) || 0,
          score: 0
        }
      };

      templateData.percent.score = templateData.percent.promoters - templateData.percent.detractors;

      return templateData;
    }

  });
});
