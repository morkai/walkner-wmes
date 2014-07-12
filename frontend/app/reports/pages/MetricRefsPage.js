// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../MetricRefCollection',
  '../views/MetricRefsView'
], function(
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
