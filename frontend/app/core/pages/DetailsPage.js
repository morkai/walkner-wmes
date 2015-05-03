// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      return createPageBreadcrumbs(this, [this[this.modelProperty].getLabel()]);
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
