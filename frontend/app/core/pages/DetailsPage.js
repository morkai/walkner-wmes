// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/DetailsView',
  './createPageBreadcrumbs'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  DetailsView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'details',

    modelProperty: 'model',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      var model = this[this.modelProperty];

      return createPageBreadcrumbs(this, [
        model.getLabel() || t.bound(model.getNlsDomain(), 'BREADCRUMBS:details')
      ]);
    },

    actions: function()
    {
      var model = this[this.modelProperty];

      return [
        pageActions.edit(model, model.privilegePrefix + ':MANAGE'),
        pageActions.delete(model, model.privilegePrefix + ':MANAGE')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this[this.modelProperty] = bindLoadingMessage(this.options.model, this);
    },

    defineViews: function()
    {
      var DetailsViewClass = this.DetailsView || DetailsView;
      var options = {
        model: this[this.modelProperty]
      };

      if (typeof this.detailsTemplate === 'function')
      {
        options.template = this.detailsTemplate;
      }

      if (typeof this.serializeDetails === 'function')
      {
        options.serializeDetails = this.serializeDetails;
      }

      this.view = new DetailsViewClass(options);
    },

    load: function(when)
    {
      return when(this[this.modelProperty].fetch(this.fetchOptions));
    }

  });
});
