// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/d8Entries/templates/details',
  'app/d8Entries/templates/strips'
], function(
  _,
  DetailsView,
  template,
  renderStrips
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {
        renderStrips: renderStrips
      });
    }

  });
});
