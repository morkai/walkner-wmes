// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  '../dictionaries',
  'app/opinionSurveys/templates/details'
], function(
  _,
  DetailsView,
  dictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    events: _.assign({

    }, DetailsView.prototype.events),

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);
    }

  });
});
