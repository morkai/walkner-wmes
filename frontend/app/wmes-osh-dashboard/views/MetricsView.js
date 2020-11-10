// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/View',
  'app/wmes-osh-dashboard/templates/metrics'
], function(
  currentUser,
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-dashboard',

    initialize: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    getTemplateData: function()
    {
      return {
        userId: currentUser.data._id,
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
