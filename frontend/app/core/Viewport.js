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

    this.defaultLayoutName = null;

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
    this.$dialog.on('show.bs.modal', this.onDialogShowing.bind(this));
    this.$dialog.on('shown.bs.modal', this.onDialogShown.bind(this));
    this.$dialog.on('hide.bs.modal', this.onDialogHiding.bind(this));
    this.$dialog.on('hidden.bs.modal', this.onDialogHidden.bind(this));
  };

  Viewport.prototype.setDefaultLayout = function(name)
  {
    this.defaultLayoutName = name;

    return this;
  };

  Viewport.prototype.registerLayout = function(name, layoutFactory)
  {
    if (!this.defaultLayoutName)
    {
      this.defaultLayoutName = name;
    }

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
      _.flatten([].concat(dependencies), true),
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
    var viewport = this;
    var layoutName = viewport.defaultLayoutName;

    if (typeof page.layoutName === 'string')
    {
      layoutName = page.layoutName;
    }
    else if (typeof page.layoutName === 'function')
    {
      layoutName = page.layoutName(viewport);
    }

    if (!_.isObject(viewport.layouts[layoutName]))
    {
      throw new Error('Unknown layout: ' + layoutName);
    }

    ++viewport.pageCounter;

    viewport.broker.publish('viewport.page.loading', {page: page});

    var requests = [];
    var priorityRequests = [];
    var normalRequests = [];
    var moduleRequests = [];

    page.trigger('beforeLoad', page, requests);

    requests.forEach(function(request)
    {
      if (!request)
      {
        return;
      }

      if (typeof request === 'string')
      {
        moduleRequests.push(request);
      }
      else if (request.priority && request.promise && request.promise.then)
      {
        priorityRequests.push(page.promised(request.promise));
      }
      else if (request.priority && request.then)
      {
        priorityRequests.push(page.promised(request));
      }
      else if (request.then)
      {
        normalRequests.push(page.promised(request));
      }
    });

    if (moduleRequests.length)
    {
      priorityRequests.unshift(loadModules(moduleRequests));
    }

    if (priorityRequests.length)
    {
      when.apply(null, priorityRequests).then(loadPage, onPageLoadFailure);
    }
    else
    {
      loadPage();
    }

    function loadPage()
    {
      if (_.isFunction(page.load))
      {
        page.load(when).then(onPageLoadSuccess, onPageLoadFailure);
      }
      else
      {
        when().then(onPageLoadSuccess, onPageLoadFailure);
      }
    }

    function when()
    {
      var requests = [];
      var priorityRequests = [];
      var moduleRequests = [];

      for (var i = 0; i < arguments.length; ++i)
      {
        requests = requests.concat(arguments[i]);
      }

      requests.forEach(function(request)
      {
        if (!request)
        {
          return;
        }

        if (typeof request === 'string')
        {
          moduleRequests.push(request);
        }
        else if (request.priority && request.promise && request.promise.then)
        {
          priorityRequests.push(page.promised(request.promise));
        }
        else if (request.priority && request.then)
        {
          priorityRequests.push(page.promised(request));
        }
        else if (request.then)
        {
          normalRequests.push(page.promised(request));
        }
      });

      if (moduleRequests.length)
      {
        priorityRequests.push(loadModules(moduleRequests));
      }

      if (priorityRequests.length)
      {
        return $.when.apply($, priorityRequests).then(function()
        {
          return $.when.apply($, normalRequests);
        });
      }

      return $.when.apply($, normalRequests);
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

      if (_.isObject(page.view) && _.isEmpty(page.views))
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

    function loadModules(modulesToLoad)
    {
      var deferred = $.Deferred();

      require(
        modulesToLoad,
        function()
        {
          deferred.resolve();
        },
        function(err)
        {
          deferred.reject(err);
        }
      );

      return deferred.promise();
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
      $header.find('.modal-title').html(title);
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

    var backdrop = _.result(dialogView, 'dialogBackdrop');

    this.$dialog.data('bs.modal').options.backdrop = backdrop == null ? true : backdrop;

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

  Viewport.prototype.adjustDialogBackdrop = function()
  {
    if (this.currentDialog)
    {
      this.$dialog.modal('adjustBackdrop');
    }
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

  Viewport.prototype.onDialogShowing = function()
  {
    if (!this.currentDialog)
    {
      return;
    }

    if (_.isFunction(this.currentDialog.onDialogShowing))
    {
      this.currentDialog.onDialogShowing(this);
    }

    this.broker.publish('viewport.dialog.showing', this.currentDialog);

    this.currentDialog.trigger('dialog:showing');
  };

  Viewport.prototype.onDialogShown = function()
  {
    if (!this.currentDialog)
    {
      return;
    }

    this.currentDialog.$('[autofocus]').focus();

    if (_.isFunction(this.currentDialog.onDialogShown))
    {
      this.currentDialog.onDialogShown(this);
    }

    this.broker.publish('viewport.dialog.shown', this.currentDialog);

    this.currentDialog.trigger('dialog:shown');
  };

  Viewport.prototype.onDialogHiding = function()
  {
    var dialog = this.currentDialog;

    if (!dialog)
    {
      return;
    }

    if (_.isFunction(dialog.remove))
    {
      dialog.trigger('dialog:hiding');

      this.broker.publish('viewport.dialog.hiding', dialog);
    }
  };

  Viewport.prototype.onDialogHidden = function()
  {
    var dialog = this.currentDialog;

    if (!dialog)
    {
      return;
    }

    this.currentDialog = null;

    if (dialog.dialogClassName)
    {
      this.$dialog.removeClass(_.result(dialog, 'dialogClassName'));
    }

    if (_.isFunction(dialog.remove))
    {
      dialog.trigger('dialog:hidden');
      dialog.remove();

      this.broker.publish('viewport.dialog.hidden', dialog);
    }

    if (this.dialogQueue.length)
    {
      this.showDialog(this.dialogQueue.shift(), this.dialogQueue.shift());
    }
  };

  return Viewport;
});
