// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  'app/wh-lines/WhLineCollection',
  'app/wh-setCarts/WhSetCartCollection'
], function(
  View,
  bindLoadingMessage,
  embedded,
  WhLineCollection,
  WhSetCartCollection
) {
  'use strict';

  return View.extend({

    remoteTopics: {
      'old.wh.lines.updated': 'onLinesUpdated',
      'old.wh.setCarts.updated': 'onSetCartsUpdated'
    },

    nlsDomain: 'wh',

    breadcrumbs: function()
    {
      return [
        {label: this.t('BREADCRUMB:base'), href: embedded.isEnabled() ? null : '#wh/pickup/0d'},
        this.t('BREADCRUMB:dist:' + this.options.kind)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    defineModels: function()
    {
      this.lines = bindLoadingMessage(new WhLineCollection(null, {
        rqlQuery: 'limit(0)'
      }), this);

      this.setCarts = bindLoadingMessage(new WhSetCartCollection(null, {
        rqlQuery: 'limit(0)&status=in=(completed,delivering)&kind=' + this.options.kind
      }), this);
    },

    defineViews: function()
    {

    },

    defineBindings: function()
    {
      this.once('afterRender', function()
      {

      });
    },

    load: function(when)
    {
      return when(
        this.lines.fetch({reset: true}),
        this.setCarts.fetch({reset: true})
      );
    },

    afterRender: function()
    {

    },

    onLinesUpdated: function(message)
    {
      console.log('onLinesUpdated', message);
    },

    onSetCartsUpdated: function(message)
    {
      console.log('onSetCartsUpdated', message);
    }

  });
});
