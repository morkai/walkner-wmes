// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/wmes-osh-common/ResolutionCollection',
  'app/wmes-osh-common/pages/DetailsPage',
  '../views/RootCausesView',
  '../views/SolutionView',
  '../views/ResolutionsView',
  'app/wmes-osh-actions/templates/details/page',
  'app/wmes-osh-actions/templates/details/props'
], function(
  _,
  ResolutionCollection,
  DetailsPage,
  RootCausesView,
  SolutionView,
  ResolutionsView,
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
          'change:resolutions',
          this.resolutions.fetch.bind(this.resolutions, {reset: true})
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

      this.rootCausesView = new RootCausesView({
        model: this.model
      });

      this.solutionView = new SolutionView({
        model: this.model
      });

      this.resolutionsView = new ResolutionsView({
        model: this.model,
        resolutions: this.resolutions
      });

      this.setView('#-rootCauses', this.rootCausesView);
      this.setView('#-solution', this.solutionView);
      this.setView('#-resolutions', this.resolutionsView);
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
