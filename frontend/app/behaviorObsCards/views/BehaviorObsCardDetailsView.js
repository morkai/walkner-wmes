// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/behaviorObsCards/templates/details'
], function(
  _,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    getTemplateData: function()
    {
      return _.assign(DetailsView.prototype.getTemplateData.call(this), {
        showEasyDiscussed: this.model.hasAnyEasy()
      });
    }

  });
});
