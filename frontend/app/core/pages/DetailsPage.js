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

      var DetailsViewClass = this.options.DetailsView || DetailsView;
      var options = {
        model: this.model
      };

      if (typeof this.options.detailsTemplate === 'function')
      {
        options.template = this.options.detailsTemplate;
      }

      if (typeof this.options.serializeDetails === 'function')
      {
        options.serializeDetails = this.options.serializeDetails;
      }

      this.view = new DetailsViewClass(options);
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    }

  });
});
