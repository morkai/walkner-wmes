define([
  'underscore',
  'jquery',
  './View',
  './util',
  './views/MessagesView',
  'app/core/templates/dialog'
], function(
  _,
  $,
  View,
  util,
  MessagesView,
  dialogTemplate
) {
  'use strict';

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

    this.$dialog = $(dialogTemplate()).appendTo(this.el).modal({
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

  Viewport.prototype.showPage = function(page)
  {
    var layoutName = _.result(page, 'layoutName');

    if (!_.isObject(this.layouts[layoutName]))
    {
      throw new Error("Unknown layout: `" + layoutName + "`");
    }

    var viewport = this;

    function when()
    {
      return $.when.apply($, _.map(arguments, page.promised, page));
    }

    function onPageLoadSuccess()
    {
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
    }

    function onPageLoadFailure()
    {
      console.log('onPageLoadFailure');

      page.remove();
    }

    if (_.isFunction(page.load))
    {
      page.load(when).then(onPageLoadSuccess, onPageLoadFailure);
    }
    else
    {
      onPageLoadSuccess();
    }
  };

  Viewport.prototype.showDialog = function(dialogView, title)
  {
    if (this.currentDialog !== null)
    {
      this.dialogQueue.push(dialogView, title);

      return this;
    }

    dialogView.render();

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

    this.$dialog.find('.modal-body').empty().append(dialogView.el);
    this.$dialog.modal('show');

    return this;
  };

  Viewport.prototype.closeDialog = function(e)
  {
    if (this.currentDialog === null)
    {
      return this;
    }

    this.$dialog.modal('hide');

    if (e)
    {
      e.preventDefault();
    }

    return this;
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

    return this.currentLayout;
  };

  Viewport.prototype.onDialogShown = function()
  {
    this.currentDialog.$('[autofocus]').focus();
  };

  Viewport.prototype.onDialogHidden = function()
  {
    if (_.isFunction(this.currentDialog.remove))
    {
      this.currentDialog.remove();
    }

    this.currentDialog = null;

    if (this.dialogQueue.length)
    {
      this.showDialog(this.dialogQueue.shift(), this.dialogQueue.shift());
    }
  };

  return Viewport;
});
