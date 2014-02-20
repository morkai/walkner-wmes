define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../MetricRefCollection',
  '../views/MetricRefsView'
], function(
  _,
  $,
  t,
  orgUnits,
  View,
  MetricRefCollection,
  MetricRefsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'metricRefs',

    breadcrumbs: function()
    {
      return [
        t.bound('reports', 'BREADCRUMBS:reports'),
        t.bound('reports', 'BREADCRUMBS:metricRefs')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.metricRefs = new MetricRefCollection({
        pubsub: this.pubsub
      });
    },

    defineViews: function()
    {
      this.view = new MetricRefsView({
        initialTab: this.options.initialTab,
        metricRefs: this.metricRefs
      });
    },

    load: function(when)
    {
      return when(this.metricRefs.fetch({reset: true}));
    }

  });
});
