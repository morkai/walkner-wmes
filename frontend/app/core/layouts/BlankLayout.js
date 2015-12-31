// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      breadcrumbs: []
    };
  };

  BlankLayout.prototype.afterRender = function()
  {
    this.changeTitle();
  };

  BlankLayout.prototype.reset = function()
  {
    this.removeView(this.pageContainerSelector);
  };

  BlankLayout.prototype.setUpPage = function(page)
  {
    if (page.breadcrumbs)
    {
      this.setBreadcrumbs(page.breadcrumbs, page);
    }
    else
    {
      this.changeTitle();
    }
  };

  /**
   * @param {function|object|string|Array.<object|string>} breadcrumbs
   * @param {string|function} breadcrumbs.label
   * @param {object} [context]
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

    this.changeTitle();

    return this;
  };

  /**
   * @private
   */
  BlankLayout.prototype.changeTitle = function()
  {
    if (this.isRendered())
    {
      this.broker.publish('page.titleChanged', _.pluck(this.model.breadcrumbs, 'label'));
    }
  };

  return BlankLayout;
});
