// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/minutesForSafetyCards/templates/details'
], function(
  _,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    events: _.extend({

    }, DetailsView.prototype.events),

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {

      });
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);


    }

  });
});
