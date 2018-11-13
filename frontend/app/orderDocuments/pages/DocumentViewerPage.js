// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'hammer',
  'app/user',
  'app/core/View',
  'app/production/snManager',
  '../views/DocumentViewerControlsView',
  '../views/DocumentViewerPreviewView',
  'app/orderDocuments/templates/page'
], function(
  _,
  $,
  Hammer,
  user,
  View,
  snManager,
  DocumentViewerControlsView,
  DocumentViewerPreviewView,
  template
) {
  'use strict';

  var IS_EMBEDDED = window.parent !== window;
  var LOADED_FILES_COUNT_TO_REFRESH = 6;
  var BROWSER_VERSION = window.navigator.userAgent.match(/(Chrome)\/([0-9]+)/) || ['Unknown/0', 'Unknown', 0];

  return View.extend({

    template: template,

    layoutName: 'blank',

    localTopics: {
      'socket.connected': 'onConnectionStatusChange',
      'socket.disconnected': 'onConnectionStatusChange'
    },

    remoteTopics: {
      'orderDocuments.remoteChecked.*': 'onRemoteDocumentChecked',
      'orderDocuments.eto.synced': 'onEtoSynced'
    },

    initialize: function()
    {
      this.loadedFilesCount = 0;
      this.hammer = null;
      this.$els = {
        controls: null,
        viewer: null
      };
      this.controlsView = new DocumentViewerControlsView({
        model: this.model
      });
      this.previewView = new DocumentViewerPreviewView({
        model: this.model
      });

      this.setView('#-controls', this.controlsView);
      this.setView('#-preview', this.previewView);

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resize.bind(this), 1));
      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));

      if (IS_EMBEDDED)
      {
        $(window).on('contextmenu.' + this.idPrefix, function(e) { e.preventDefault(); });
      }

      this.listenTo(this.model, 'change:prodLine', this.joinProdLine);
      this.listenTo(this.model, 'save', _.debounce(this.updateClientState.bind(this), 1000));
      this.listenTo(
        this.controlsView,
        'documentReloadRequested',
        this.previewView.loadDocument.bind(this.previewView)
      );
      this.listenTo(
        this.controlsView,
        'documentWindowRequested',
        setTimeout.bind(window, this.previewView.openDocumentWindow.bind(this.previewView), 1)
      );
      this.listenTo(this.previewView, 'fileLoaded', this.onFileLoaded);

      this.socket.on('orderDocuments.remoteOrderUpdated', this.onRemoteOrderUpdated.bind(this));

      snManager.bind(this);
    },

    destroy: function()
    {
      $('body').removeClass('no-overflow orderDocuments');
      $(window).off('.' + this.idPrefix);

      if (this.hammer)
      {
        this.hammer.destroy();
        this.hammer = null;
      }
    },

    load: function(when)
    {
      this.model.load();

      return when();
    },

    beforeRender: function()
    {
      if (this.hammer)
      {
        this.hammer.destroy();
        this.hammer = null;
      }
    },

    afterRender: function()
    {
      this.$els.controls = this.$id('controls');
      this.$els.viewport = this.$id('viewport');

      $('body').addClass('no-overflow orderDocuments');

      this.toggleConnectionStatus();
      this.resize();
      this.checkInitialConfig();

      if (IS_EMBEDDED)
      {
        this.hammer = new Hammer(document.body);

        this.hammer.on('swipe', function(e)
        {
          if (e.deltaX > 0)
          {
            window.parent.postMessage({type: 'switch', app: 'documents'}, '*');
          }
        });

        window.parent.postMessage({type: 'ready', app: 'documents'}, '*');
      }
    },

    resize: function()
    {
      this.controlsView.resize(null, window.innerHeight);
      this.previewView.resize(null, window.innerHeight);
    },

    toggleConnectionStatus: function()
    {
      this.$el
        .removeClass('is-connected is-disconnected')
        .addClass(this.socket.isConnected() ? 'is-connected' : 'is-disconnected');
    },

    joinProdLine: function()
    {
      if (!this.socket.isConnected())
      {
        return;
      }

      var model = this.model;
      var prodLine = model.get('prodLine');

      if (prodLine._id)
      {
        this.socket.emit('orderDocuments.join', {
          clientId: model.id,
          prodLineId: prodLine._id,
          settings: model.getSettings(),
          orderInfo: model.getCurrentOrderInfo()
        });
      }
    },

    updateClientState: function()
    {
      if (this.socket.isConnected())
      {
        this.socket.emit('orderDocuments.update', {
          clientId: this.model.id,
          settings: this.model.getSettings(),
          orderInfo: this.model.getCurrentOrderInfo()
        });
      }
    },

    checkInitialConfig: function()
    {
      if (!this.model.get('prodLine')._id)
      {
        this.controlsView.openSettingsDialog();
      }
    },

    onKeyDown: function(e)
    {
      if (e.ctrlKey && e.keyCode === 70)
      {
        this.controlsView.focusFilter();

        return false;
      }

      if (e.keyCode === 27)
      {
        this.controlsView.clearFilter();
        this.controlsView.scrollIntoView();
      }
    },

    onConnectionStatusChange: function()
    {
      this.toggleConnectionStatus();
      this.joinProdLine();
    },

    onRemoteOrderUpdated: function(remoteOrderData)
    {
      if (remoteOrderData.no === null)
      {
        return;
      }

      this.model.setRemoteOrder(remoteOrderData);
      this.model.save();
    },

    onRemoteDocumentChecked: function(message)
    {
      if (this.model.get('localFile') !== null)
      {
        return;
      }

      var currentOrder = this.model.getCurrentOrder();

      if (currentOrder.nc15 === message.nc15)
      {
        this.previewView.loadDocument();
      }
    },

    onEtoSynced: function(message)
    {
      var currentOrder = this.model.getCurrentOrder();

      if (currentOrder.nc15 === 'ETO' && currentOrder.nc12 === message.nc12)
      {
        this.previewView.loadDocument();

        return;
      }

      this.model.checkEtoExistence(message.nc12);
    },

    onFileLoaded: function()
    {
      // PDF Viewer memory leak was fixed in Chrome v49
      if (BROWSER_VERSION[1] !== 'Chrome' || BROWSER_VERSION[2] >= 49)
      {
        return;
      }

      this.loadedFilesCount += 1;

      if (this.loadedFilesCount !== LOADED_FILES_COUNT_TO_REFRESH)
      {
        return;
      }

      this.listenTo(this.model, 'change:localFile change:localOrder change:remoteOrder', function()
      {
        var fileSource = this.model.get('fileSource');

        if (fileSource === 'remote' || fileSource === 'local')
        {
          return setTimeout(window.location.reload.bind(window.location), 10);
        }
      });
    }

  });
});
