// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/DetailsView',
  './decorateProdFunction',
  'app/prodFunctions/templates/details'
], function(
  DetailsView,
  decorateProdFunction,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'companies.synced': 'render'
    },

    serialize: function()
    {
      return {model: decorateProdFunction(this.model)};
    }

  });
});
