// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
