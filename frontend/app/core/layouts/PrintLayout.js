define([
  'underscore',
  'jquery',
  'moment',
  'app/user',
  '../View',
  'app/core/templates/printLayout'
], function(
  _,
  $,
  moment,
  user,
  View,
  printLayoutTemplate
) {
  'use strict';

  var PrintLayout = View.extend({

    pageContainerSelector: '.print-page-bd',

    template: printLayoutTemplate

  });

  PrintLayout.prototype.initialize = function()
  {
    this.model = {
      id: null,
      actions: [],
      breadcrumbs: []
    };
  };

  PrintLayout.prototype.destroy = function()
  {
    if (this.el.ownerDocument)
    {
      this.el.ownerDocument.body.classList.remove('print');
    }
  };

  PrintLayout.prototype.afterRender = function()
  {
    this.changeTitle();

    if (this.model.id !== null)
    {
      this.setId(this.model.id);
    }

    if (this.el.ownerDocument)
    {
      this.el.ownerDocument.body.classList.add('print');
    }
  };

  PrintLayout.prototype.reset = function()
  {
    this.setId(null);

    this.model.breadcrumbs = [];

    this.removeView(this.pageContainerSelector);
  };

  PrintLayout.prototype.setUpPage = function(page)
  {
    if (page.pageId)
    {
      this.setId(page.pageId);
    }

    if (page.breadcrumbs)
    {
      this.setBreadcrumbs(page.breadcrumbs, page);
    }
    else
    {
      this.changeTitle();
    }

    this.listenTo(page, 'afterRender', this.fitToPrintablePage);
  };

  /**
   * @param {string} id
   * @returns {PrintLayout}
   */
  PrintLayout.prototype.setId = function(id)
  {
    if (this.isRendered())
    {
      this.$el.attr('data-id', id);
    }

    this.model.id = id;

    return this;
  };

  /**
   * @param {function|object|string|Array.<object|string>} breadcrumbs
   * @param {string|function} breadcrumbs.label
   * @param {object} [context]
   * @returns {PrintLayout}
   */
  PrintLayout.prototype.setBreadcrumbs = function(breadcrumbs, context)
  {
    if (breadcrumbs == null)
    {
      return this;
    }

    if (typeof breadcrumbs === 'function')
    {
      breadcrumbs = breadcrumbs.call(context);
    }

    if (!Array.isArray(breadcrumbs))
    {
      breadcrumbs = [breadcrumbs];
    }

    this.model.breadcrumbs = breadcrumbs.map(function(breadcrumb)
    {
      var breadcrumbType = typeof breadcrumb;

      if (breadcrumbType === 'string' || breadcrumbType === 'function')
      {
        breadcrumb = {label: breadcrumb};
      }

      return breadcrumb;
    });

    this.changeTitle();

    return this;
  };

  /**
   * @private
   */
  PrintLayout.prototype.changeTitle = function()
  {
    if (this.isRendered())
    {
      this.broker.publish(
        'page.titleChanged', _.pluck(this.model.breadcrumbs, 'label')
      );
    }
  };

  PrintLayout.prototype.fitToPrintablePage = function($pageView)
  {
    var $pages = this.$('.print-pages');
    var $pageTpl = $pages.find('.print-page');
    var $hd = $pageTpl.find('.print-page-hd');
    var $ft = $pageTpl.find('.print-page-ft');
    var $bd = $pageTpl.find('.print-page-bd');
    var $bdContainer = $('<div class="print-page-bd-container"></div>');

    if (_.isFunction($pageView.hdLeft))
    {
      $hd.find('.print-page-hd-left').text($pageView.hdLeft.call($pageView));
    }

    if (_.isFunction($pageView.hdRight))
    {
      $hd.find('.print-page-hd-right').text($pageView.hdRight.call($pageView));
    }

    var pageHeight = 1122;
    var pageMargins = {
      top: parseFloat($pageTpl.css('padding-top')) || 0,
      left: parseFloat($pageTpl.css('padding-left')) || 0,
      right: parseFloat($pageTpl.css('padding-right')) || 0,
      bottom: parseFloat($pageTpl.css('padding-bottom')) || 0
    };
    var hdHeight = $hd.outerHeight(true);
    var ftHeight = $ft.outerHeight(true);
    var bdContainerHeight = pageHeight - pageMargins.top - pageMargins.bottom - hdHeight - ftHeight;
    var pages;

    if (_.isFunction($pageView.fitToPrintablePage))
    {
      pages = $pageView.fitToPrintablePage.call($pageView, bdContainerHeight);
    }
    else if (_.isObject($pageView.view) && _.isFunction($pageView.view.fitToPrintablePage))
    {
      pages = $pageView.view.fitToPrintablePage.call($pageView, bdContainerHeight);
    }
    else
    {
      pages = [$pageView.$el.detach()];
    }

    $bdContainer.height(bdContainerHeight);
    $bd.wrap($bdContainer);

    $pageTpl.detach();

    pages.forEach(function($pageBd, i)
    {
      var $page = $pageTpl.clone();

      $page.find('.print-page-bd').append($pageBd);
      $page.find('.print-page-no').text(i + 1);
      $page.addClass('print-page-fit');

      $pages.append($page);
    });

    $pageTpl.remove();

    this.$('.print-page-count').text(pages.length);
    this.$('.print-page-date').text(moment().format('LLL'));
    this.$('.print-page-user').text(user.data.name || user.data.login);
  };

  return PrintLayout;
});
