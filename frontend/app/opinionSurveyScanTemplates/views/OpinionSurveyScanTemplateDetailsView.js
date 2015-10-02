// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

      return _.extend(DetailsView.prototype.serialize.call(this), {
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
