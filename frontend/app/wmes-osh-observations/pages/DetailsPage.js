// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/pages/DetailsPage',
  '../views/ObservationsView',
  'app/wmes-osh-observations/templates/details/page',
  'app/wmes-osh-observations/templates/details/props'
], function(
  DetailsPage,
  ObservationsView,
  template,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template,
    propsTemplate,

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.behaviorsView = new ObservationsView({
        property: 'behaviors',
        model: this.model
      });

      this.workConditionsView = new ObservationsView({
        property: 'workConditions',
        model: this.model
      });

      this.setView('#-behaviors', this.behaviorsView);
      this.setView('#-workConditions', this.workConditionsView);
    }

  });
});
