// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/details'
], function(
  _,
  DetailsView,
  qiDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    serializeDetails: function(model)
    {
      return model.serializeDetails(qiDictionaries);
    }

  });
});
