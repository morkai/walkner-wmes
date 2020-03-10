// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/i18n',
  '../View',
  'app/core/templates/pageLayout'
], function(
  _,
  $,
  user,
  t,
  View,
  template
) {
  'use strict';

  var PageLayout = View.extend({

    pageContainerSelector: '.bd',

    template: template

  });

  PageLayout.prototype.initialize = function()
  {
    this.model = {
      id: null,
      className: null,
      actions: [],
      breadcrumbs: [],
      title: null
    };

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$header = null;

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$breadcrumbs = null;

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$actions = null;

    this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 1000 / 15);

    $(window).on('resize', this.onWindowResize);
  };

  PageLayout.prototype.destroy = function()
  {
    $(window).off('resize', this.onWindowResize);

    if (this.el.ownerDocument)
    {
      this.el.ownerDocument.body.classList.remove('page');
    }

    this.$breadcrumbs = null;
    this.$actions = null;
  };

  PageLayout.prototype.serialize = function()
  {
    return _.assign(View.prototype.serialize.call(this), {
      hdHidden: !!this.options.hdHidden,
      version: this.options.version,
      changelogUrl: this.options.changelogUrl
    });
  };

  PageLayout.prototype.afterRender = function()
  {
    if (this.el.ownerDocument)
    {
      this.el.ownerDocument.body.classList.add('page');
    }

    this.$header = this.$('.page-header').first();
    this.$breadcrumbs = this.$('.page-breadcrumbs').first();
    this.$actions = this.$('.page-actions').first();

    this.changeTitle();
    this.renderBreadcrumbs();
    this.renderActions();

    if (this.model.id !== null)
    {
      this.setId(this.model.id);
    }

    if (this.model.className !== null)
    {
      this.setClassName(this.model.className);
    }
  };

  PageLayout.prototype.reset = function()
  {
    this.setId(null);
    this.setClassName(null);

    this.model.title = null;

    if (this.$header)
    {
      this.$header[0].style.display = 'none';
    }

    if (this.$breadcrumbs)
    {
      this.model.breadcrumbs = [];

      this.$breadcrumbs.empty();
    }

    if (this.$actions)
    {
      this.model.actions = [];

      this.$actions.empty();
    }

    this.removeView(this.pageContainerSelector);
  };

  PageLayout.prototype.setUpPage = function(page)
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

    if (page.actions)
    {
      this.setActions(page.actions, page);
    }
  };

  /**
   * @param {string} id
   * @returns {PageLayout}
   */
  PageLayout.prototype.setId = function(id)
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
   * @returns {PageLayout}
   */
  PageLayout.prototype.setClassName = function(className)
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
   * @param {function|Object|string|Array.<Object|string>} breadcrumbs
   * @param {string|function} breadcrumbs.label
   * @param {string} [breadcrumbs.href]
   * @param {Object} [context]
   * @returns {PageLayout}
   */
  PageLayout.prototype.setBreadcrumbs = function(breadcrumbs, context)
  {
    if (breadcrumbs == null)
    {
      return this;
    }

    if (typeof breadcrumbs === 'function')
    {
      breadcrumbs = breadcrumbs.call(context, this);
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
        breadcrumb = {label: breadcrumb, href: null};
      }

      if (typeof breadcrumb.href === 'string' && breadcrumb.href[0] !== '#')
      {
        breadcrumb.href = '#' + breadcrumb.href;
      }

      return breadcrumb;
    });

    if (this.$breadcrumbs)
    {
      this.renderBreadcrumbs();
    }

    if (!this.model.page)
    {
      this.changeTitle();
    }

    return this;
  };

  /**
   * @param {function|string|Array.<string>} title
   * @param {Object} [context]
   * @returns {PageLayout}
   */
  PageLayout.prototype.setTitle = function(title, context)
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
   * @param {function|Object|string|Array.<Object|string>} actions
   * @param {string} actions.label
   * @param {string} [actions.type]
   * @param {string} [actions.icon]
   * @param {string} [actions.href]
   * @param {function} [actions.callback]
   * @param {Object} [context]
   * @returns {PageLayout}
   */
  PageLayout.prototype.setActions = function(actions, context)
  {
    if (actions == null)
    {
      return this;
    }

    if (typeof actions === 'function')
    {
      actions = actions.call(context, this);
    }

    if (!actions)
    {
      return this;
    }

    if (!Array.isArray(actions))
    {
      actions = [actions];
    }

    this.model.actions = actions.map(this.prepareAction.bind(this, context));

    if (this.$actions)
    {
      this.renderActions();
    }

    return this;
  };

  /**
   * @private
   */
  PageLayout.prototype.onWindowResize = function()
  {
    this.adjustBreadcrumbsPosition();
  };

  /**
   * @private
   * @param {*} context
   * @param {Object} action
   * @returns {*}
   */
  PageLayout.prototype.prepareAction = function(context, action)
  {
    if (action.prepared)
    {
      return action;
    }

    if (!action.id)
    {
      action.id = '';
    }

    action.idPrefix = context && context.idPrefix || '';

    if (typeof action.href === 'string')
    {
      var firstChar = action.href.charAt(0);

      if (firstChar !== '#' && firstChar !== '/')
      {
        action.href = '#' + action.href;
      }
    }
    else
    {
      action.href = null;
    }

    if (typeof action.icon === 'string')
    {
      action.icon = 'fa-' + action.icon.split(' ').join(' fa-');
    }

    if (!action.className)
    {
      action.className = '';
    }

    action.prepared = true;

    return action;
  };

  /**
   * @private
   */
  PageLayout.prototype.renderBreadcrumbs = function()
  {
    var breadcrumbs = this.model.breadcrumbs;
    var html = '';

    for (var i = 0, l = breadcrumbs.length; i < l; ++i)
    {
      var breadcrumb = breadcrumbs[i];

      html += '<li>';

      if (typeof breadcrumb.template === 'function')
      {
        html += breadcrumb.template(breadcrumb, this);
      }
      else if (!breadcrumb.href)
      {
        html += breadcrumb.label;
      }
      else
      {
        html += '<a href="' + breadcrumb.href + '">' + breadcrumb.label + '</a>';
      }
    }

    this.$breadcrumbs.html(html);
    this.$header[0].style.display = '';

    this.adjustBreadcrumbsPosition();

    this.trigger('afterRender:breadcrumbs');
  };

  /**
   * @private
   */
  PageLayout.prototype.adjustBreadcrumbsPosition = function()
  {
    if (window.innerWidth < 768)
    {
      var top = (this.$('.navbar-header').outerHeight() - this.$breadcrumbs.outerHeight()) / 2;

      this.$breadcrumbs.css('top', top + 'px');
    }
  };

  /**
   * @private
   */
  PageLayout.prototype.renderActions = function()
  {
    var actions = this.model.actions;
    var callbacks = {};
    var afterRender = {};
    var html = '';

    for (var i = 0, l = actions.length; i < l; ++i)
    {
      var action = actions[i];
      var privileges = action.privileges;

      if (privileges)
      {
        if (_.isFunction(privileges))
        {
          if (!privileges(user))
          {
            continue;
          }
        }
        else if (Array.isArray(privileges))
        {
          if (!user.isAllowedTo.apply(user, privileges))
          {
            continue;
          }
        }
        else if (!user.isAllowedTo(privileges))
        {
          continue;
        }
      }

      if (typeof action.callback === 'function')
      {
        callbacks[i] = action.callback.bind(this);
      }

      if (typeof action.afterRender === 'function')
      {
        afterRender[i] = action.afterRender.bind(this);
      }

      html += '<li data-index="' + i + '">';

      if (typeof action.template === 'function')
      {
        html += action.template(action, this);
      }
      else
      {
        var className = 'btn btn-' + (action.type || 'default') + ' ' + _.result(action, 'className');

        if (action.disabled)
        {
          className += ' disabled';
        }

        var id = _.result(action, 'id');

        if (id && id.charAt(0) === '-')
        {
          id = action.idPrefix + id;
        }

        if (action.href === null)
        {
          html += '<button id="' + id + '" class="' + className + '">';
        }
        else
        {
          html += '<a id="' + id
            + '" class="' + className
            + '" href="' + action.href
            + '" target="' + (action.target || '_self') + '">';
        }

        if (typeof action.icon === 'string')
        {
          html += '<i class="fa ' + action.icon + '"></i>';
        }

        if (action.label)
        {
          html += '<span>' + action.label + '</span>';
        }

        html += action.href ? '</a>' : '</button>';
      }
    }

    this.$actions.html(html);

    var $actions = this.$actions.find('li');

    Object.keys(callbacks).forEach(function(i)
    {
      $actions.filter('li[data-index="' + i + '"]').click(actions[i].callback);
    });

    Object.keys(afterRender).forEach(function(i)
    {
      afterRender[i]($actions.filter('li[data-index="' + i + '"]'), actions[i]);
    });

    this.$header[0].style.display = '';

    this.trigger('afterRender:actions');
  };

  /**
   * @private
   */
  PageLayout.prototype.changeTitle = function()
  {
    if (this.isRendered())
    {
      var newTitle = Array.isArray(this.model.title)
        ? [].concat(this.model.title)
        : _.pluck(this.model.breadcrumbs, 'label');

      this.broker.publish('page.titleChanged', newTitle);
    }
  };

  return PageLayout;
});
