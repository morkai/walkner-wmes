// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/View',
  '../views/DocumentViewerControlsView',
  '../views/DocumentViewerPreviewView',
  'app/orderDocuments/templates/page'
], function(
  _,
  $,
  user,
  View,
  DocumentViewerControlsView,
  DocumentViewerPreviewView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'blank',

    localTopics: {
      'socket.connected': 'onConnectionStatusChange',
      'socket.disconnected': 'onConnectionStatusChange'
    },

    initialize: function()
    {
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

      this.setView('.orderDocuments-page-controls', this.controlsView);
      this.setView('.orderDocuments-page-preview', this.previewView);

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resize.bind(this), 1));
      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));

      this.listenTo(this.model, 'change:prodLine', this.joinProdLine);
      this.listenTo(
        this.controlsView,
        'documentReloadRequested',
        this.previewView.loadDocument.bind(this.previewView)
      );

      this.socket.on('orderDocuments.remoteOrderUpdated', this.onRemoteOrderUpdated.bind(this));
    },

    destroy: function()
    {
      $('body').removeClass('no-overflow orderDocuments');
      $(window).off('.' + this.idPrefix);
    },

    load: function(when)
    {
      this.model.load();

      return when();
    },

    afterRender: function()
    {
      this.$els.controls = this.$id('controls');
      this.$els.viewport = this.$id('viewport');

      $('body').addClass('no-overflow orderDocuments');

      this.toggleConnectionStatus();
      this.resize();
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

      var prodLine = this.model.get('prodLine');

      if (prodLine._id)
      {
        this.socket.emit('orderDocuments.join', {
          clientId: this.model.id,
          prodLineId: prodLine._id
        });
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
      this.model.setRemoteOrder(remoteOrderData);
      this.model.save();
    }

  });
});
