// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/templates/listPage',
  '../views/ProdLineStateDisplayOptionsView',
  '../views/ProdLineStateListView'
], function(
  _,
  $,
  t,
  View,
  bindLoadingMessage,
  listPageTemplate,
  ProdLineStateDisplayOptionsView,
  ProdLineStateListView
) {
  'use strict';

  return View.extend({

    pageId: 'prodLineStateList',

    template: listPageTemplate,

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    remoteTopics: {
      'production.edited.shift.*': function(message)
      {
        if (!message.comments)
        {
          return;
        }

        [
          this.model.prodLineStates.get(message.prodLine),
          this.model.historyData.get(message._id)
        ].forEach(function(prodLineState)
        {
          if (!prodLineState)
          {
            return;
          }

          var prodShift = prodLineState.get('prodShift');

          if (!prodShift || prodShift.id !== message._id)
          {
            return;
          }

          prodLineState.update({
            prodShift: {
              comments: message.comments
            }
          });
        });
      }
    },

    breadcrumbs: function()
    {
      return [
        {
          label: this.t('bc:layout'),
          href: '#factoryLayout'
        },
        this.t('bc:list')
      ];
    },

    actions: function()
    {
      return [{
        label: this.t('pa:settings'),
        icon: 'cogs',
        privileges: 'FACTORY_LAYOUT:MANAGE',
        href: '#factoryLayout;settings?tab=blacklist'
      }];
    },

    initialize: function()
    {
      this.historyDataReq = null;

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('.filter-container', this.displayOptionsView);
      this.setView('.list-container', this.listView);
    },

    destroy: function()
    {
      this.historyDataReq = null;

      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.listView = new ProdLineStateListView({
        model: this.model,
        displayOptions: this.displayOptions
      });

      this.displayOptionsView = new ProdLineStateDisplayOptionsView({
        model: this.displayOptions
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.displayOptions, 'change', this.onDisplayOptionsChange);
    },

    load: function(when)
    {
      if (this.displayOptions.isHistoryData())
      {
        this.model.historyData.url = '/production/history?' + this.displayOptions.serializeToString();

        return when(this.model.load(false), this.model.historyData.fetch({reset: true}));
      }

      return when(this.model.load(false));
    },

    afterRender: function()
    {
      this.model.load(false);
    },

    onDisplayOptionsChange: function()
    {
      this.broker.publish('router.navigate', {
        url: '/factoryLayout;list?' + this.displayOptions.serializeToString(),
        trigger: false,
        replace: true
      });

      if (this.displayOptions.haveHistoryOptionsChanged())
      {
        this.toggleHistoryData();
      }
    },

    toggleHistoryData: function()
    {
      this.model.historyData.reset([]);

      this.displayOptionsView.toggleHistoryData();
      this.listView.render();

      if (this.historyDataReq !== null)
      {
        this.historyDataReq.abort();
        this.historyDataReq = null;
      }

      if (this.displayOptions.isHistoryData())
      {
        this.model.historyData.url = '/production/history?' + this.displayOptions.serializeToString();

        var page = this;

        this.historyDataReq = this.promised(this.model.historyData.fetch({reset: true}));
        this.historyDataReq.always(function() { page.historyDataReq = null; });
      }
    }

  });
});
