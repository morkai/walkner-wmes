// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  './CoordSectionsDetailsView',
  'app/kaizenCategories/templates/details',
  'css!app/kaizenCategories/assets/coordSections'
], function(
  DetailsView,
  CoordSectionsDetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.setView('#-coordSections', new CoordSectionsDetailsView({model: this.model}));
    }

  });
});
