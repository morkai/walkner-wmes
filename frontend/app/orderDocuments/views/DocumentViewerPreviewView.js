// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orderDocuments/templates/preview',
  'app/orderDocuments/templates/documentWindow'
], function(
  _,
  $,
  t,
  viewport,
  View,
  template,
  renderDocumentWindow
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

    openDocumentWindow: function()
    {
      var currentOrderInfo = this.model.getCurrentOrderInfo();
      var width = window.innerWidth * 0.95;
      var height = window.innerHeight * 0.95;
      var left = Math.floor((window.innerWidth - width) / 2);
      var top = Math.floor((window.innerHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);

      var win = window.open('', currentOrderInfo.documentNc15, windowFeatures);

      if (win)
      {
        win.document.write(renderDocumentWindow({
          title: currentOrderInfo.documentName,
          src: this.$iframe.attr('src')
        }));
        win.document.close();
      }
      else
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('orderDocuments', 'popup:document')
        });
      }
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
        this.model.setFileSource('local');
        this.setLoadingMessage('localFile');

        this.loadFile(URL.createObjectURL(localFile.file));

        return;
      }

      var currentOrder = this.model.getCurrentOrder();

      if (!currentOrder.nc15)
      {
        this.model.setFileSource(null);

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
      if (this.$iframe && document.activeElement === this.$iframe[0])
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

      this.$iframe.one('load', function()
      {
        view.$id('loading').addClass('hidden');
        view.trigger('fileLoaded', src);
      });
      this.$iframe.prop('src', src);
    },

    tryLoadRemoteDocument: function(nc15)
    {
      var view = this;

      view.model.setFileSource('remote');
      view.setLoadingMessage('remoteServer');

      if (nc15 === 'ORDER')
      {
        return view.loadFile(
          window.location.pathname
          + window.location.search
          + '#orders/' + view.model.getCurrentOrder().no
        );
      }

      var remoteFileUrl = view.model.getRemoteFileUrl(nc15) + '?' + view.getRemoteFileUrlQuery();

      if (view.req)
      {
        view.req.abort();
      }

      view.req = this.ajax({
        type: 'HEAD',
        url: remoteFileUrl
      });

      view.req.fail(function()
      {
        view.req = null;
        view.tryLoadLocalDocument(nc15);
      });

      view.req.done(function(res, status, jqXhr)
      {
        var fileSource = jqXhr.getResponseHeader('X-Document-Source');

        if (fileSource)
        {
          view.model.setFileSource(fileSource);
        }

        view.req = null;
        view.loadFile(remoteFileUrl);
      });
    },

    tryLoadLocalDocument: function(nc15)
    {
      this.model.setFileSource('local');
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
        this.model.setFileSource(null);

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
        view.model.setFileSource(null);
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
    },

    getRemoteFileUrlQuery: function()
    {
      var currentOrder = this.model.getCurrentOrder();
      var query = 'order=' + (currentOrder.no || '')
        + '&w=' + this.$iframe.width()
        + '&h=' + this.$iframe.height();

      if (window.location.search.indexOf('touch') === -1)
      {
        query += '&pdf=1';
      }

      return query;
    }

  });
});
