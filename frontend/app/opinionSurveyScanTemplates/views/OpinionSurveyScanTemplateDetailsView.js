// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  '../util/getRegionLabel',
  'app/opinionSurveyScanTemplates/templates/details',
  'app/opinionSurveyScanTemplates/templates/region'
], function(
  _,
  DetailsView,
  getRegionLabel,
  template,
  regionTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    serialize: function()
    {
      var survey = this.model.get('survey');

      return _.assign(DetailsView.prototype.serialize.call(this), {
        regions: this.model.get('regions').map(function(region)
        {
          return {
            label: getRegionLabel(survey, region.question),
            region: region
          };
        }),
        renderRegion: regionTemplate
      });
    }

  });
});
