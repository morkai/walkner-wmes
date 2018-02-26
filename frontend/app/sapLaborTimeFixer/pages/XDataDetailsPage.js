// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/pageActions',
  '../views/XDataTabsView',
  'app/sapLaborTimeFixer/templates/details'
], function(
  _,
  $,
  viewport,
  View,
  pageActions,
  XDataTabsView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {label: this.t('BREADCRUMBS:browse'), href: this.model.genClientUrl('base')},
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [pageActions.delete(this.model)];
    },

    initialize: function()
    {
      this.defineViews();
      this.defineBindings();

      this.setView('#-tabs', this.tabsView);
    },

    destroy: function()
    {

    },

    defineViews: function()
    {
      this.tabsView = new XDataTabsView({model: this.model});
    },

    defineBindings: function()
    {
      this.listenTo(this.model, 'change:workCenter change:deps', this.updateUrl);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl()
          + '?workCenter=' + encodeURIComponent(this.model.getSelectedWorkCenter()._id)
          + '&deps=' + encodeURIComponent(this.model.getSelectedDeps().join(','))
      });
    }

  });
});
