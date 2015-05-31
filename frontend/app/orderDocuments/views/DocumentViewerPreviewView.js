// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/orderDocuments/templates/preview'
], function(
  _,
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.$iframe = null;

      this.listenTo(
        this.model,
        'change:localFile change:localOrder change:remoteOrder',
        _.debounce(this.onOrderChange.bind(this), 1, true)
      );

      if (window.navigator.userAgent.indexOf('Chrome/') !== -1)
      {
        this.timers.blurIframe = setInterval(this.blurIframe.bind(this), 333);
      }
    },

    destroy: function()
    {
      this.$iframe.remove();
      this.$iframe = null;
    },

    afterRender: function()
    {
      this.$iframe = this.$id('iframe');

      this.resize(null, window.innerHeight);
      this.loadDocument();
    },

    loadDocument: function()
    {
      if (!this.$iframe)
      {
        return;
      }

      var $loading = this.$id('loading').removeClass('hidden is-failure');

      this.$iframe.prop('src', '');

      var localFile = this.model.get('localFile');

      if (localFile)
      {
        this.model.set('fileSource', 'local');
        this.setLoadingMessage('localFile');

        this.loadFile(URL.createObjectURL(localFile.file));

        return;
      }

      var currentOrder = this.model.getCurrentOrder();

      if (!currentOrder.nc15)
      {
        this.model.set('fileSource', null);

        $loading.addClass('hidden');

        return;
      }

      this.tryLoadRemoteDocument(currentOrder.nc15);
    },

    resize: function(w, h)
    {
      if (this.$iframe === null)
      {
        return;
      }

      if (w !== null)
      {
        this.$iframe.prop('width', w + 'px');
      }

      if (h !== null)
      {
        this.$iframe.prop('height', h + 'px');
      }
    },

    blurIframe: function()
    {
      if (document.activeElement === this.$iframe[0])
      {
        this.$iframe.blur();
      }
    },

    onOrderChange: function()
    {
      this.loadDocument();
    },

    loadFile: function(src)
    {
      var view = this;

      this.$iframe.one('load', function() { view.$id('loading').addClass('hidden'); });
      this.$iframe.prop('src', src);
    },

    tryLoadRemoteDocument: function(nc15)
    {
      this.model.set('fileSource', 'remote');
      this.setLoadingMessage('remoteServer');

      var view = this;
      var remoteFileUrl = this.model.getRemoteFileUrl(nc15);

      if (this.req)
      {
        this.req.abort();
      }

      this.req = this.ajax({
        type: 'HEAD',
        url: remoteFileUrl
      });

      this.req.fail(function()
      {
        view.req = null;
        view.tryLoadLocalDocument(nc15);
      });

      this.req.done(function()
      {
        view.req = null;
        view.loadFile(remoteFileUrl);
      });
    },

    tryLoadLocalDocument: function(nc15)
    {
      this.model.set('fileSource', 'local');
      this.setLoadingMessage('localServer');

      var view = this;
      var localFileUrl = this.model.getLocalFileUrl(nc15);

      if (this.req)
      {
        this.req.abort();
        this.req = null;
      }

      if (localFileUrl === null)
      {
        this.$id('loading').addClass('is-failure');
        this.model.set('fileSource', null);

        return;
      }

      this.req = this.ajax({
        type: 'HEAD',
        url: localFileUrl
      });

      this.req.fail(function()
      {
        view.req = null;
        view.$id('loading').addClass('is-failure');
        view.model.set('fileSource', null);
        view.setLoadingMessage('failure');
      });

      this.req.done(function()
      {
        view.req = null;
        view.loadFile(localFileUrl);
      });
    },

    setLoadingMessage: function(key)
    {
      this.$id('message').text(t('orderDocuments', 'preview:msg:loading:' + key));
    }

  });
});
