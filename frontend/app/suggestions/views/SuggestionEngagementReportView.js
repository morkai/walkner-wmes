// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/suggestions/templates/engagementReport'
], function(
  _,
  t,
  View,
  formatTooltipHeader,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:groups', this.render);
    },

    getTemplateData: function()
    {
      return {
        formatHeader: formatTooltipHeader.bind(this),
        groups: this.model.get('groups'),
        counters: [
          'nearMisses',
          'suggestions',
          'observations',
          'minutes',
          'audits',
          'talks',
          'total'
        ]
      };
    }

  });
});
