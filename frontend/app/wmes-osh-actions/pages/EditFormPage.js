// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/ResolutionCollection',
  'app/wmes-osh-common/pages/EditFormPage',
  '../views/FormView'
], function(
  ResolutionCollection,
  EditFormPage,
  FormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView,

    remoteTopics: function()
    {
      const topics = EditFormPage.prototype.remoteTopics
        ? EditFormPage.prototype.remoteTopics.apply(this, arguments)
        : {};

      topics[`${this.model.getTopicPrefix()}.relations.${this.model.id}`] = 'onRelationsUpdated';

      return topics;
    },

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.apply(this, arguments);

      this.resolutions = new ResolutionCollection(null, {parent: this.model});
    },

    getFormViewOptions: function()
    {
      return Object.assign(EditFormPage.prototype.getFormViewOptions.apply(this, arguments), {
        resolutions: this.resolutions
      });
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
