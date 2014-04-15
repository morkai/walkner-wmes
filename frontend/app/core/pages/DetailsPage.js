// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  '../util/bindLoadingMessage',
  '../util/pageActions',
  '../View',
  '../views/DetailsView'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  DetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'details',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound(this.model.nlsDomain, 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, this.model.privilegePrefix + ':MANAGE'),
        pageActions.delete(this.model, this.model.privilegePrefix + ':MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      var DetailsViewClass = this.DetailsView || DetailsView;
      var options = {
        model: this.model
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
      return when(this.model.fetch(this.fetchOptions));
    }

  });
});
