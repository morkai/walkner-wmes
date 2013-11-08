define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/user',
  '../View',
  'app/core/templates/navbar',
  'i18n!app/nls/core'
], function(
  $,
  _,
  i18n,
  user,
  View,
  navbarTemplate
) {
  'use strict';

  /**
   * @constructor
   * @extends {app.core.View}
   * @param {object} [options]
   */
  var NavbarView = View.extend({

    template: navbarTemplate,

    localTopics: {
      'router.executing': function onRouterExecuting(message)
      {
        this.activateNavItem(this.getModuleNameFromPath(message.req.path));
      },
      'socket.connected': function onSocketConnected()
      {
        this.setConnectionStatus('online');
      },
      'socket.connecting': function onSocketConnecting()
      {
        this.setConnectionStatus('connecting');
      },
      'socket.connectFailed': function onSocketConnectFailed()
      {
        this.setConnectionStatus('offline');
      },
      'socket.disconnected': function onSocketDisconnected()
      {
        this.setConnectionStatus('offline');
      }
    },

    events: {
      'click .disabled a': function onDisabledEntryClick(e)
      {
        e.preventDefault();
      },
      'click .navbar-account-locale': function onLocaleClick(e)
      {
        e.preventDefault();

        this.changeLocale(e.currentTarget.getAttribute('data-locale'));
      },
      'click .navbar-account-logIn': function onLogInClick(e)
      {
        e.preventDefault();

        this.trigger('logIn');
      },
      'click .navbar-account-logOut': function onLogOutClick(e)
      {
        e.preventDefault();

        this.trigger('logOut');
      }
    }

  });

  NavbarView.DEFAULT_OPTIONS = {
    /**
     * @type {string}
     */
    activeItemClassName: 'active',
    /**
     * @type {string}
     */
    offlineStatusClassName: 'navbar-status-offline',
    /**
     * @type {string}
     */
    onlineStatusClassName: 'navbar-status-online',
    /**
     * @type {string}
     */
    connectingStatusClassName: 'navbar-status-connecting'
  };

  NavbarView.prototype.initialize = function()
  {
    _.defaults(this.options, NavbarView.DEFAULT_OPTIONS);

    /**
     * @private
     * @type {string}
     */
    this.activeModuleName = '';

    /**
     * @private
     * @type {object.<string, jQuery>|null}
     */
    this.navItems = null;

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$activeNavItem = null;
  };

  NavbarView.prototype.beforeRender = function()
  {
    this.navItems = null;
    this.$activeNavItem = null;
  };

  NavbarView.prototype.afterRender = function()
  {
    this.selectActiveNavItem();
    this.setConnectionStatus(this.socket.isConnected() ? 'online' : 'offline');
    this.hideNotAllowedEntries();
  };

  NavbarView.prototype.serialize = function()
  {
    return {user: user};
  };

  /**
   * @param {string} moduleName
   */
  NavbarView.prototype.activateNavItem = function(moduleName)
  {
    if (moduleName === this.activeModuleName)
    {
      return;
    }

    this.activeModuleName = moduleName;

    this.selectActiveNavItem();
  };

  /**
   * @param {string} newLocale
   */
  NavbarView.prototype.changeLocale = function(newLocale)
  {
    i18n.reload(newLocale);
  };

  NavbarView.prototype.setConnectionStatus = function(status)
  {
    if (!this.isRendered())
    {
      return;
    }

    var $status = this.$('.navbar-account-status');

    $status
      .removeClass(this.options.offlineStatusClassName)
      .removeClass(this.options.onlineStatusClassName)
      .removeClass(this.options.connectingStatusClassName);

    $status.addClass(this.options[status + 'StatusClassName']);

    this.toggleConnectionStatusEntries(status === 'online');
  };

  /**
   * @private
   * @param {string} path
   * @returns {string}
   */
  NavbarView.prototype.getModuleNameFromPath = function(path)
  {
    if (path[0] === '/')
    {
      path = path.substr(1);
    }

    if (path === '')
    {
      return '';
    }

    var matches = path.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/);

    return matches ? matches[1] : null;
  };

  /**
   * @private
   */
  NavbarView.prototype.selectActiveNavItem = function()
  {
    if (!this.isRendered())
    {
      return;
    }

    if (this.navItems === null)
    {
      this.cacheNavItems();
    }

    var activeItemClassName = this.options.activeItemClassName;

    if (this.$activeNavItem !== null)
    {
      this.$activeNavItem.removeClass(activeItemClassName);
    }

    var $newActiveNavItem = this.navItems[this.activeModuleName];

    if (_.isUndefined($newActiveNavItem))
    {
      this.$activeNavItem = null;
    }
    else
    {
      $newActiveNavItem.addClass(activeItemClassName);

      this.$activeNavItem = $newActiveNavItem;
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.cacheNavItems = function()
  {
    this.navItems = {};

    this.$('.nav > li').each(this.cacheNavItem.bind(this));
  };

  /**
   * @private
   * @param {number} i
   * @param {Element} navItemEl
   */
  NavbarView.prototype.cacheNavItem = function(i, navItemEl)
  {
    var $navItem = this.$(navItemEl);

    if ($navItem.hasClass(this.options.activeItemClassName))
    {
      this.$activeNavItem = $navItem;
    }

    var href = $navItem.find('a').attr('href');

    if (href && href[0] === '#')
    {
      var moduleName = this.getModuleNameFromPath(href.substr(1));

      this.navItems[moduleName] = $navItem;
    }
    else if ($navItem.hasClass('dropdown'))
    {
      var view = this;

      $navItem.find('.dropdown-menu > li > a').each(function()
      {
        var href = this.getAttribute('href');

        if (href && href[0] === '#')
        {
          var moduleName = view.getModuleNameFromPath(href.substr(1));

          view.navItems[moduleName] = $navItem;
        }
      });
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.hideNotAllowedEntries = function()
  {
    var navbarView = this;

    this.$('li[data-privilege]').each(function()
    {
      var $li = navbarView.$(this);
      var privilege = $li.attr('data-privilege');

      $li[user.isAllowedTo(privilege) ? 'show' : 'hide']();
    });

    this.$('li[data-loggedin]').each(function()
    {
      var $li = navbarView.$(this);
      var loggedIn = $li.attr('data-loggedin');
      var state = loggedIn === 'false'
        ? !user.isLoggedIn()
        : user.isLoggedIn();

      $li[state ? 'show' : 'hide']();
    });
  };

  /**
   * @private
   * @param {boolean} online
   */
  NavbarView.prototype.toggleConnectionStatusEntries = function(online)
  {
    var navbarView = this;

    this.$('li[data-online]').each(function()
    {
      /*jshint -W015*/

      var $li = navbarView.$(this);

      switch ($li.attr('data-online'))
      {
        case 'show':
          $li[online ? 'show' : 'hide']();
          break;

        case 'hide':
          $li[online ? 'hide' : 'show']();
          break;

        default:
          $li[online ? 'removeClass' : 'addClass']('disabled');
          break;
      }
    });
  };

  return NavbarView;
});
