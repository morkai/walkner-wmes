// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  '../View',
  'app/core/templates/blankLayout'
], function(
  _,
  $,
  user,
  View,
  blankLayoutTemplate
) {
  'use strict';

  var BlankLayout = View.extend({

    pageContainerSelector: '.blank-page-bd',

    template: blankLayoutTemplate

  });

  BlankLayout.prototype.initialize = function()
  {
    this.model = {
      id: null,
      className: null,
      breadcrumbs: [],
      title: null
    };
  };

  BlankLayout.prototype.afterRender = function()
  {
    this.changeTitle();

    if (this.model.id !== null)
    {
      this.setId(this.model.id);
    }

    if (this.model.className !== null)
    {
      this.setClassName(this.model.className);
    }
  };

  BlankLayout.prototype.reset = function()
  {
    this.setId(null);
    this.setClassName(null);

    this.model.title = null;
    this.model.breadcrumbs = [];

    this.removeView(this.pageContainerSelector);
  };

  BlankLayout.prototype.setUpPage = function(page)
  {
    if (page.pageId)
    {
      this.setId(page.pageId);
    }

    if (page.pageClassName)
    {
      this.setClassName(page.pageClassName);
    }

    if (page.title)
    {
      this.setTitle(page.title, page);
    }

    if (page.breadcrumbs)
    {
      this.setBreadcrumbs(page.breadcrumbs, page);
    }

    if (!page.breadcrumbs && !page.title)
    {
      this.changeTitle();
    }
  };

  /**
   * @param {string} id
   * @returns {BlankLayout}
   */
  BlankLayout.prototype.setId = function(id)
  {
    if (this.isRendered())
    {
      this.$el.attr('data-id', id);
    }

    this.model.id = id;

    return this;
  };

  /**
   * @param {string} className
   * @returns {BlankLayout}
   */
  BlankLayout.prototype.setClassName = function(className)
  {
    if (document.body)
    {
      if (this.model.className)
      {
        document.body.classList.remove(this.model.className);
      }

      if (this.isRendered() && className)
      {
        document.body.classList.add(className);
      }
    }

    this.model.className = className;

    return this;
  };

  /**
   * @param {function|string|Array.<string>} title
   * @param {Object} [context]
   * @returns {BlankLayout}
   */
  BlankLayout.prototype.setTitle = function(title, context)
  {
    if (title == null)
    {
      return this;
    }

    if (typeof title === 'function')
    {
      title = title.call(context, this);
    }

    if (!Array.isArray(title))
    {
      title = [title];
    }

    this.model.title = title;

    this.changeTitle();

    return this;
  };

  /**
   * @param {function|Object|string|Array.<Object|string>} breadcrumbs
   * @param {string|function} breadcrumbs.label
   * @param {Object} [context]
   * @returns {BlankLayout}
   */
  BlankLayout.prototype.setBreadcrumbs = function(breadcrumbs, context)
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

    if (!this.model.title)
    {
      this.changeTitle();
    }

    return this;
  };

  /**
   * @private
   */
  BlankLayout.prototype.changeTitle = function()
  {
    if (this.isRendered())
    {
      var newTitle = Array.isArray(this.model.title)
        ? [].concat(this.model.title)
        : _.pluck(this.model.breadcrumbs, 'label');

      this.broker.publish('page.titleChanged', newTitle);
    }
  };

  return BlankLayout;
});
