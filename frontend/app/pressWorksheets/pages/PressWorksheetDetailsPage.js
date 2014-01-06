define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../views/PressWorksheetDetailsView'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  View,
  PressWorksheetDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'pressWorksheetDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound(this.model.nlsDomain, 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound(this.model.nlsDomain, 'BREADCRUMBS:details')
      ];
    },

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      this.view = new PressWorksheetDetailsView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
