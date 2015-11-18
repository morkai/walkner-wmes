// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        buttonType: this.options.buttonType,
        buttonUrl: this.options.buttonUrl,
        buttonLabel: this.options.buttonLabel,
        browseUrl: this.options.browseUrl,
        total: this.model.get('total'),
        user: this.model.get('user')
      };
    }

  });
});
