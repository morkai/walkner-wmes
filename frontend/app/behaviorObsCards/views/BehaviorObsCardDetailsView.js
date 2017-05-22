// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/behaviorObsCards/templates/details'
], function(
  _,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {
        showEasyDiscussed: this.model.hasAnyEasy()
      });
    }

  });
});
