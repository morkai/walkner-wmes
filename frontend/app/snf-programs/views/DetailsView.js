// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  '../Program',
  'app/snf-programs/templates/details'
], function(
  _,
  DetailsView,
  Program,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    getTemplateData: function()
    {
      return _.assign(DetailsView.prototype.getTemplateData.call(this), Program.OPTIONS);
    }

  });
});
