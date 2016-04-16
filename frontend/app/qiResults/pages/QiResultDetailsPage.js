// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/qiResults/dictionaries',
  '../views/QiResultDetailsView'
], function(
  DetailsPage,
  pageActions,
  qiDictionaries,
  QiResultDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,

    DetailsView: QiResultDetailsView,

    actions: function()
    {
      var model = this.model;
      var actions = [];

      if (model.canEdit())
      {
        actions.push(pageActions.edit(model, false));
      }

      if (model.canDelete())
      {
        actions.push(pageActions.delete(model, false));
      }

      return actions;
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      qiDictionaries.unload();
    },

    load: function(when)
    {
      return when(this.model.fetch(), qiDictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      qiDictionaries.load();
    }

  });
});
