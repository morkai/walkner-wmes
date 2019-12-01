// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/LineStateView',
  'app/wmes-ct-state/templates/listPage'
], function(
  View,
  bindLoadingMessage,
  LineStateView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:base')
      ];
    },

    actions: function()
    {
      return [
        {
          href: '#ct/reports/pce',
          label: this.t('PAGE_ACTIONS:pceReport')
        },
        {
          href: '#ct/pces',
          label: this.t('PAGE_ACTIONS:pces')
        },
        {
          href: '#ct/lines',
          label: this.t('PAGE_ACTIONS:lines'),
          privileges: 'PROD_DATA:MANAGE'
        },
        {
          href: '#ct/carts',
          label: this.t('PAGE_ACTIONS:carts'),
          privileges: 'PROD_DATA:MANAGE'
        }
      ];
    },

    remoteTopics: {
      'ct.state.updated': function(message)
      {
        this.collection.update(message);
      },
      'ct.lines.*': function()
      {
        // TODO
        this.promised(this.collection.fetch({reset: true}));
      }
    },

    initialize: function()
    {
      this.collection.loading = false;

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(this.collection, this);
    },

    defineViews: function()
    {

    },

    defineBindings: function()
    {
      this.listenTo(this.collection, 'request', this.onModelRequest);
      this.listenTo(this.collection, 'error', this.onModelError);
      this.listenTo(this.collection, 'sync', this.onModelSync);

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'reset', this.render);
      });
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    beforeRender: function()
    {
      this.removeView('#-lines');
    },

    afterRender: function()
    {
      var view = this;

      view.collection.forEach(function(lineState)
      {
        var lineStateView = new LineStateView({
          model: lineState
        });

        view.insertView('#-lines', lineStateView);

        lineStateView.render();
      });
    },

    onModelRequest: function()
    {
      this.collection.loading = true;
    },

    onModelError: function()
    {
      this.collection.loading = false;
    },

    onModelSync: function()
    {
      this.collection.loading = false;
    }

  });
});
