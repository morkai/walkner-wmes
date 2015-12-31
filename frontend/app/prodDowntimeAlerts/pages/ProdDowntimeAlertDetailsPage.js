// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/prodDowntimeAlerts/templates/details'
], function(
  DetailsPage,
  template
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: '#prodDowntimes',

    detailsTemplate: template

  });
});
