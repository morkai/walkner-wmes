// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/engagementReport'
], function(
  _,
  t,
  View,
  formatTooltipHeader,
  kaizenDictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:groups', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        formatHeader: formatTooltipHeader.bind(this),
        groups: this.model.get('groups')
      };
    }

  });
});
