// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/embedded',
  'app/production/snManager',
  '../views/DocumentViewerControlsView',
  '../views/DocumentViewerPreviewView',
  '../views/BomView',
  'app/orderDocuments/templates/page'
], function(
  _,
  $,
  t,
  user,
  View,
  embedded,
  snManager,
  DocumentViewerControlsView,
  DocumentViewerPreviewView,
  BomView,
  template
) {
  'use strict';

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
      var page = this;

      page.loadedFilesCount = 0;
      page.$els = {
        controls: null,
        viewer: null
      };

      page.defineViews();
      page.defineBindings();

      snManager.bind(page);

      page.setView('#-controls', page.controlsView);
      page.setView('#-preview', page.previewView);
      page.setView('#-bom', page.bomView);
    },

    defineViews: function()
    {
      this.controlsView = new DocumentViewerControlsView({
        model: this.model
      });

      this.previewView = new DocumentViewerPreviewView({
        model: this.model
      });

      this.bomView = new BomView({
        model: this.model
      });
    },

    defineBindings: function()
    {
      var page = this;
      var updateClientState = _.debounce(page.updateClientState.bind(page), 1000);
      var joinProdLine = _.debounce(page.joinProdLine.bind(page), 1);

      page.listenTo(page.model, 'change:prodLine change:station', joinProdLine);
      page.listenTo(page.model, 'change:prodLkine', page.onProdLineChanged);
      page.listenTo(page.model, 'change:spigotCheck', page.defineSpigotBindings);
      page.listenTo(page.model, 'change:bom', page.onBomChanged);
      page.listenTo(page.model, 'save', function()
      {
        updateClientState();

        if (!page.model.isBomActive() || page.model.isConfirmableDocumentSelected())
        {
          page.model.set('bom', null);
        }
      });
      page.listenTo(
        page.controlsView,
        'documentReloadRequested',
        page.previewView.loadDocument.bind(page.previewView)
      );
      page.listenTo(
        page.controlsView,
        'documentWindowRequested',
        setTimeout.bind(window, page.previewView.openDocumentWindow.bind(page.previewView), 1)
      );
      page.listenTo(page.previewView, 'loadDocument:success', page.onFileLoaded);

      page.socket.on('orderDocuments.remoteOrderUpdated', page.onRemoteOrderUpdated.bind(page));

      page.defineSpigotBindings();

      $(window).on('resize.' + page.idPrefix, _.debounce(page.resize.bind(page), 1));
      $(window).on('keydown.' + page.idPrefix, page.onKeyDown.bind(page));

      if (embedded.isEnabled())
      {
        $(window).on('contextmenu.' + page.idPrefix, function(e) { e.preventDefault(); });

        page.cancelPinchZoom = function(e)
        {
          if (e.touches && e.touches.length > 1)
          {
            e.preventDefault();
          }
        };

        window.addEventListener('touchstart', page.cancelPinchZoom, {passive: false});
      }
    },

    defineSpigotBindings: function()
    {
      var prodLineId = this.model.get('prodLine')._id;

      if (!prodLineId || !this.model.get('spigotCheck'))
      {
        if (this.spigotCheckSub)
        {
          this.spigotCheckSub.cancel();
          this.spigotCheckSub = null;
        }

        return;
      }

      if (this.spigotCheckSub)
      {
        if (this.spigotCheckSub.prodLineId === prodLineId)
        {
          return;
        }

        this.spigotCheckSub.cancel();
      }

      this.spigotCheckSub = this.pubsub.subscribe(
        'production.spigotCheck.*.' + prodLineId,
        this.onSpigotMessage.bind(this)
      );
      this.spigotCheckSub.prodLineId = prodLineId;
    },

    destroy: function()
    {
      $('body').removeClass('no-overflow orderDocuments');
      $(window).off('.' + this.idPrefix);

      if (this.cancelPinchZoom)
      {
        window.removeEventListener('touchstart', this.cancelPinchZoom);
      }
    },

    load: function(when)
    {
      return when(this.model.load());
    },

    afterRender: function()
    {
      var page = this;

      page.$els.controls = page.$id('controls');
      page.$els.viewport = page.$id('viewport');

      $('body').addClass('no-overflow orderDocuments');

      page.toggleConnectionStatus();
      page.resize();
      page.checkInitialConfig();

      if (embedded.isEnabled())
      {
        window.WMES_DOCS_BOM_TOGGLE = page.toggleBom.bind(page);
        window.WMES_DOCS_BOM_ACTIVE = page.model.isBomActive.bind(page.model);

        page.onBomChanged();

        window.parent.postMessage({type: 'ready', app: 'documents'}, '*');
      }
    },

    resize: function()
    {
      this.controlsView.resize(null, window.innerHeight);
      this.previewView.resize(null, window.innerHeight);
      this.resizeBom();
    },

    resizeBom: function()
    {
      var filterForm = this.controlsView.$id('filterForm')[0];
      var filterTop = filterForm ? filterForm.offsetTop : 0;

      this.$id('bom').css('height', (window.innerHeight - filterTop + 1) + 'px');
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
          station: model.get('station'),
          settings: model.getSettings(),
          orderInfo: model.getCurrentOrderInfo()
        });

        this.defineSpigotBindings();
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

    onSpigotMessage: function(message, topic)
    {
      switch (topic.split('.')[2])
      {
        case 'requested':
          this.onSpigotRequested(message);
          break;

        case 'failure':
          this.onSpigotFailure(message);
          break;

        case 'success':
          this.onSpigotSuccess(message);
          break;

        case 'aborted':
          this.onSpigotAborted();
          break;
      }
    },

    scheduleSpigotMessageHideTimer: function()
    {
      var page = this;

      clearTimeout(page.timers.hideSpigotMessage);

      page.timers.hideSpigotMessage = setTimeout(function()
      {
        page.skipNextSpigotRequest = false;
        page.onSnScanned = null;

        snManager.hideMessage();
      }, 7500);
    },

    onSpigotAborted: function()
    {
      clearTimeout(this.timers.hideSpigotMessage);

      this.skipNextSpigotRequest = false;
      this.onSnScanned = null;

      snManager.hideMessage();
    },

    onSpigotRequested: function(message)
    {
      this.onSnScanned = this.onSpigotScanned.bind(this);

      if (this.skipNextSpigotRequest)
      {
        this.skipNextSpigotRequest = false;
      }
      else
      {
        snManager.showMessage({_id: '', orderNo: message.orderNo}, 'warning', function()
        {
          return t('orderDocuments', 'spigot:request', {
            component: message.component ? message.component.name : '?'
          });
        }, 15000);
      }

      this.scheduleSpigotMessageHideTimer();
    },

    onSpigotFailure: function(message)
    {
      this.skipNextSpigotRequest = true;

      snManager.showMessage({_id: message.input, orderNo: message.orderNo}, 'error', function()
      {
        return t('orderDocuments', 'spigot:failure');
      }, 15000);

      this.scheduleSpigotMessageHideTimer();
    },

    onSpigotSuccess: function(message)
    {
      this.skipNextSpigotRequest = true;

      snManager.showMessage(
        {_id: message.input, orderNo: message.orderNo},
        'success',
        function() { return t('orderDocuments', 'spigot:success'); },
        message.source === 'spigotChecker' ? 3000 : 15000
      );

      this.scheduleSpigotMessageHideTimer();
    },

    onSpigotScanned: function(scanInfo)
    {
      this.skipNextSpigotRequest = true;

      snManager.showMessage({_id: scanInfo._id}, 'warning', function()
      {
        return t('orderDocuments', 'spigot:checking');
      }, 15000);

      this.pubsub.publish('production.spigotCheck.scanned.' + this.model.get('prodLine')._id, {
        nc12: scanInfo._id
      });

      this.scheduleSpigotMessageHideTimer();
    },

    onKeyDown: function(e)
    {
      if (embedded.isEnabled())
      {
        return;
      }

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
      this.controlsView.checkNotes();

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
    },

    toggleBom: function(newState, done)
    {
      var currentOrder = this.model.getCurrentOrder();

      if (!currentOrder.no)
      {
        return done(true);
      }

      if (this.model.isConfirmableDocumentSelected())
      {
        newState = false;
      }
      else if (newState === null)
      {
        newState = !this.model.isBomActive();
      }

      if (newState)
      {
        this.showBom(done);
      }
      else
      {
        this.hideBom(done);
      }
    },

    hideBom: function(done)
    {
      var bom = this.model.get('bom');

      if (bom && bom.active)
      {
        bom = _.defaults({active: false}, bom);

        this.model.set('bom', bom);
      }

      if (done)
      {
        done();
      }
    },

    showBom: function(done)
    {
      var page = this;

      if (page.model.isBomActive())
      {
        if (done)
        {
          done();
        }

        return;
      }

      if (page.model.isBomAvailable())
      {
        var bom = _.defaults({active: true}, this.model.get('bom'));

        page.model.set('bom', bom);

        if (done)
        {
          done();
        }

        return;
      }

      var currentOrder = page.model.getCurrentOrder();
      var req = page.ajax({
        url: '/orders/' + currentOrder.no + '/documentContents?result=bom'
      });

      req.fail(function()
      {
        page.hideBom(function()
        {
          if (done)
          {
            done(true);
          }
        });
      });

      req.done(function(bom)
      {
        bom.active = true;
        bom.orderNo = currentOrder.no;

        page.model.set('bom', bom);

        if (done)
        {
          done();
        }
      });
    },

    onBomChanged: function()
    {
      var active = this.model.isBomActive();
      var $preview = this.previewView.$iframe;

      if ($preview && $preview.length && $preview[0].contentWindow.toggleBom)
      {
        $preview[0].contentWindow.toggleBom(active);
      }

      if (active)
      {
        this.resizeBom();
        this.bomView.render();
      }

      this.$id('bom').toggleClass('hidden', !active);
    },

    onProdLineChanged: function()
    {
      this.setUpConfirmedSub();
    },

    setUpConfirmedSub: function()
    {
      if (this.confirmedSub)
      {
        this.confirmedSub.cancel();
        this.confirmedSub = null;
      }

      var prodLine = this.model.get('prodLine')._id;

      if (!prodLine)
      {
        return;
      }

      this.confirmedSub = this.pubsub.subscribe(
        'orderDocuments.confirmed.' + prodLine,
        this.onDocumentConfirmed.bind(this)
      );
    },

    onDocumentConfirmed: function(confirmation)
    {
      this.model.handleConfirmation(confirmation);
    }

  });
});
