// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'jquery',
  './View',
  './util',
  './views/MessagesView',
  'app/core/templates/dialogContainer'
], function(
  require,
  _,
  $,
  View,
  util,
  MessagesView,
  dialogContainerTemplate
) {
  'use strict';

  var DEFAULT_PAGE_FACTORY = function(Page)
  {
    return new Page();
  };

  function Viewport(options)
  {
    View.call(this, options);

    this.msg = options.messagesView ? options.messagesView : new MessagesView({el: this.el});

    this.document = options.document || window.document;

    this.layouts = {};

    this.currentLayout = null;

    this.currentLayoutName = null;

    this.currentPage = null;

    this.$dialog = null;

    this.dialogQueue = [];

    this.currentDialog = null;

    this.pageCounter = 0;

    this.closeDialog = this.closeDialog.bind(this);

    this.$el.on('click', '.viewport-dialog .cancel', this.closeDialog);
  }

  util.inherits(Viewport, View);

  Viewport.prototype.cleanup = function()
  {
    this.broker.destroy();
    this.msg.remove();
    this.$dialog.remove();

    if (this.currentPage)
    {
      this.currentPage.remove();
    }

    if (this.currentLayout)
    {
      this.currentLayout.remove();
    }

    if (this.currentDialog)
    {
      this.currentDialog.remove();
    }

    _.invoke(this.dialogQueue.filter(_.isObject), 'remove');

    this.$el.off('click', '.viewport-dialog .cancel', this.closeDialog);

    this.broker = null;
    this.msg = null;
    this.$dialog = null;
    this.currentLayout = null;
    this.currentDialog = null;
    this.dialogQueue = null;
    this.layouts = null;
  };

  Viewport.prototype.afterRender = function()
  {
    if (this.$dialog !== null)
    {
      return this.closeDialog();
    }

    this.$dialog = $(dialogContainerTemplate()).appendTo(this.el).modal({
      show: false,
      backdrop: true
    });
    this.$dialog.on('shown.bs.modal', this.onDialogShown.bind(this));
    this.$dialog.on('hidden.bs.modal', this.onDialogHidden.bind(this));
  };

  Viewport.prototype.registerLayout = function(name, layoutFactory)
  {
    this.layouts[name] = layoutFactory;

    return this;
  };

  Viewport.prototype.loadPage = function(dependencies, createPage)
  {
    this.msg.loading();

    if (!_.isFunction(createPage))
    {
      createPage = DEFAULT_PAGE_FACTORY;
    }

    var viewport = this;
    var pageCounter = ++this.pageCounter;

    require(
      [].concat(dependencies),
      function()
      {
        if (pageCounter === viewport.pageCounter)
        {
          viewport.showPage(createPage.apply(null, arguments));
        }

        viewport.msg.loaded();
      },
      function(err)
      {
        if (pageCounter === viewport.pageCounter)
        {
          viewport.msg.loadingFailed();

          viewport.broker.publish('viewport.page.loadingFailed', {
            page: null,
            xhr: {
              status: 0,
              responseText: err.stack || err.message
            }
          });
        }
      }
    );
  };

  Viewport.prototype.showPage = function(page)
  {
    var layoutName = _.result(page, 'layoutName');

    if (!_.isObject(this.layouts[layoutName]))
    {
      throw new Error('Unknown layout: `' + layoutName + '`');
    }

    ++this.pageCounter;

    var viewport = this;

    this.broker.publish('viewport.page.loading', {page: page});

    if (_.isFunction(page.load))
    {
      page.load(when).then(onPageLoadSuccess, onPageLoadFailure);
    }
    else
    {
      when().then(onPageLoadSuccess, onPageLoadFailure);
    }

    function when()
    {
      var requests = [];

      for (var i = 0; i < arguments.length; ++i)
      {
        var request = arguments[i];

        if (Array.isArray(request))
        {
          requests.push.apply(requests, request);
        }
        else
        {
          requests.push(request);
        }
      }

      page.trigger('beforeLoad', page, requests);

      return $.when.apply($, _.map(requests, page.promised, page));
    }

    function onPageLoadSuccess()
    {
      viewport.broker.publish('viewport.page.loaded', {page: page});

      page.trigger('afterLoad', page);

      if (viewport.currentPage !== null)
      {
        viewport.currentPage.remove();
      }

      viewport.currentPage = page;

      var layout = viewport.setLayout(layoutName);

      if (_.isFunction(layout.setUpPage))
      {
        layout.setUpPage(page);
      }

      if (_.isFunction(page.setUpLayout))
      {
        page.setUpLayout(layout);
      }

      if (_.isObject(page.view))
      {
        page.setView(page.view);
      }

      layout.setView(layout.pageContainerSelector, page);

      if (!viewport.isRendered())
      {
        viewport.render();
      }
      else if (!layout.isRendered())
      {
        layout.render();
      }
      else
      {
        page.render();
      }

      viewport.broker.publish('viewport.page.shown', page);
    }

    function onPageLoadFailure(jqXhr)
    {
      page.remove();

      viewport.broker.publish('viewport.page.loadingFailed', {page: page, xhr: jqXhr});
    }
  };

  Viewport.prototype.showDialog = function(dialogView, title)
  {
    if (this.currentDialog !== null)
    {
      this.dialogQueue.push(dialogView, title);

      return this;
    }

    var triggerEvent = true;
    var afterRender = dialogView.afterRender;
    var viewport = this;

    dialogView.afterRender = function()
    {
      var $modalBody = viewport.$dialog.find('.modal-body');

      if ($modalBody.children()[0] !== dialogView.el)
      {
        $modalBody.empty().append(dialogView.el);
      }

      if (triggerEvent)
      {
        triggerEvent = false;

        viewport.$dialog.modal('show');
      }

      if (_.isFunction(afterRender))
      {
        afterRender.apply(dialogView, arguments);
      }
    };

    this.currentDialog = dialogView;

    var $header = this.$dialog.find('.modal-header');

    if (title)
    {
      $header.find('.modal-title').text(title);
      $header.show();
    }
    else
    {
      $header.hide();
    }

    if (dialogView.dialogClassName)
    {
      this.$dialog.addClass(_.result(dialogView, 'dialogClassName'));
    }

    dialogView.render();

    return this;
  };

  Viewport.prototype.closeDialog = function(e)
  {
    if (this.currentDialog === null)
    {
      return this;
    }

    this.$dialog.modal('hide');

    if (e && e.preventDefault)
    {
      e.preventDefault();
    }

    return this;
  };

  Viewport.prototype.closeDialogs = function(closeCurrent, filter)
  {
    this.dialogQueue = this.dialogQueue.filter(filter || closeCurrent);

    if (typeof closeCurrent === 'function' && this.currentDialog && closeCurrent(this.currentDialog))
    {
      this.closeDialog();
    }
  };

  Viewport.prototype.closeAllDialogs = function()
  {
    this.dialogQueue = [];

    this.closeDialog();
  };

  Viewport.prototype.setLayout = function(layoutName)
  {
    if (layoutName === this.currentLayoutName)
    {
      if (_.isFunction(this.currentLayout.reset))
      {
        this.currentLayout.reset();
      }

      return this.currentLayout;
    }

    var createNewLayout = this.layouts[layoutName];
    var selector = this.options.selector || '';

    if (_.isObject(this.currentLayout))
    {
      this.removeView(selector);
    }

    this.currentLayoutName = layoutName;
    this.currentLayout = createNewLayout();

    this.setView(selector, this.currentLayout);
    this.trigger('layout:change', this.currentLayoutName, this.currentLayout);

    return this.currentLayout;
  };

  Viewport.prototype.onDialogShown = function()
  {
    this.currentDialog.$('[autofocus]').focus();

    if (_.isFunction(this.currentDialog.onDialogShown))
    {
      this.currentDialog.onDialogShown(this);
    }

    this.broker.publish('viewport.dialog.shown', this.currentDialog);

    this.currentDialog.trigger('dialog:shown');
  };

  Viewport.prototype.onDialogHidden = function()
  {
    if (this.currentDialog.dialogClassName)
    {
      this.$dialog.removeClass(_.result(this.currentDialog, 'dialogClassName'));
    }

    if (_.isFunction(this.currentDialog.remove))
    {
      this.currentDialog.trigger('dialog:hidden');
      this.currentDialog.remove();

      this.broker.publish('viewport.dialog.hidden', this.currentDialog);
    }

    this.currentDialog = null;

    if (this.dialogQueue.length)
    {
      this.showDialog(this.dialogQueue.shift(), this.dialogQueue.shift());
    }
  };

  return Viewport;
});
