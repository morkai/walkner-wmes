// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/dashboard/templates/kaizenMetrics'
], function(
  _,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    getTemplateData: function()
    {
      return {
        buttonType: this.options.buttonType,
        buttonUrl: this.options.buttonUrl,
        buttonLabel: this.options.buttonLabel,
        browseUrl: this.options.browseUrl,
        sortProperty: this.options.sortProperty,
        openStatuses: this.options.openStatuses,
        total: this.model.get('total'),
        user: this.model.get('user')
      };
    }

  });
});
