// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/wmes-osh-common/ResolutionCollection',
  'app/wmes-osh-common/pages/DetailsPage',
  '../views/ObservationsView',
  'app/wmes-osh-observations/templates/details/page',
  'app/wmes-osh-observations/templates/details/props'
], function(
  _,
  ResolutionCollection,
  DetailsPage,
  ObservationsView,
  template,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template,
    propsTemplate,

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        this.listenTo(
          this.model,
          'change:behaviors change:workConditions',
          _.debounce(this.resolutions.fetch.bind(this.resolutions, {reset: true}), 1)
        );
      });
    },

    remoteTopics: function()
    {
      const topics = DetailsPage.prototype.remoteTopics.apply(this, arguments);

      topics[`${this.model.getTopicPrefix()}.relations.${this.model.id}`] = 'onRelationsUpdated';

      return topics;
    },

    defineModels: function()
    {
      DetailsPage.prototype.defineModels.apply(this, arguments);

      this.resolutions = new ResolutionCollection(null, {
        parent: this.model
      });
    },

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.behaviorsView = new ObservationsView({
        property: 'behaviors',
        model: this.model,
        resolutions: this.resolutions
      });

      this.workConditionsView = new ObservationsView({
        property: 'workConditions',
        model: this.model,
        resolutions: this.resolutions
      });

      this.setView('#-behaviors', this.behaviorsView);
      this.setView('#-workConditions', this.workConditionsView);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.resolutions.fetch({reset: true})
      );
    },

    onRelationsUpdated: function({relation, change})
    {
      const resolution = this.resolutions.get(relation.rid);

      if (resolution)
      {
        resolution.handleUpdate(change);
      }
    }

  });
});
