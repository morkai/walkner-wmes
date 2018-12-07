// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/data/orgUnits',
  '../View',
  'app/mor/Mor',
  'app/mor/views/MorView',
  'app/users/util/setUpUserSelect2',
  'app/core/templates/navbar',
  'app/core/templates/navbar/searchResults'
], function(
  _,
  t,
  user,
  time,
  viewport,
  orgUnits,
  View,
  Mor,
  MorView,
  setUpUserSelect2,
  navbarTemplate,
  renderSearchResults
) {
  'use strict';

  var DIVISIONS = {};

  orgUnits.getAllByType('division').forEach(function(division)
  {
    DIVISIONS[division.id.replace(/[^A-Za-z0-9]/g, '').toUpperCase()] = division.id;
  });

  /**
   * @constructor
   * @extends {app.core.View}
   * @param {Object} [options]
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
      },
      'click .navbar-feedback': function onFeedbackClick(e)
      {
        e.preventDefault();

        e.target.disabled = true;

        this.trigger('feedback', function()
        {
          e.target.disabled = false;
        });
      },
      'mouseup .btn[data-href]': function(e)
      {
        if (e.button === 2)
        {
          return;
        }

        var href = e.currentTarget.dataset.href;

        if (e.ctrlKey || e.button === 1)
        {
          window.open(href);
        }
        else
        {
          window.location.href = href;
        }

        document.body.click();

        return false;
      },
      'submit #-search': function()
      {
        return false;
      },
      'focus #-searchPhrase': function()
      {
        clearTimeout(this.timers.hideSearchResults);
        this.handleSearch();
      },
      'blur #-searchPhrase': function()
      {
        clearTimeout(this.timers.hideSearchResults);
        this.timers.hideSearchResults = setTimeout(this.hideSearchResults.bind(this), 250);
      },
      'keydown #-searchPhrase': function(e)
      {
        if (e.keyCode === 13)
        {
          this.selectActiveSearchResult();

          return false;
        }

        if (e.keyCode === 38)
        {
          this.selectPrevSearchResult();

          return false;
        }

        if (e.keyCode === 40)
        {
          this.selectNextSearchResult();

          return false;
        }
      },
      'keyup #-searchPhrase': function(e)
      {
        if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40)
        {
          return false;
        }

        if (e.keyCode === 27)
        {
          e.target.value = '';

          this.handleSearch();

          return false;
        }

        if (e.target.value.length <= 1)
        {
          this.handleSearch();

          return;
        }

        if (this.timers.handleSearch)
        {
          clearTimeout(this.timers.handleSearch);
        }

        this.timers.handleSearch = setTimeout(this.handleSearch.bind(this), 1000 / 30);
      },
      'mouseup #-mor': function(e)
      {
        if (!e.ctrlKey && e.button === 0)
        {
          this.showMor();

          return false;
        }
      },
      'click #-mor': function(e)
      {
        if (!e.ctrlKey && e.button === 0)
        {
          return false;
        }
      },
      'click #-openLayout': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        var screen = window.screen;
        var width = screen.availWidth * 0.8;
        var height = screen.availHeight * 0.9;
        var left = Math.floor((screen.availWidth - width) / 2);
        var top = Math.floor((screen.availHeight - height) / 2) - (screen.height - screen.availHeight);
        var windowFeatures = 'resizable,scrollbars,location=no'
          + ',top=' + top
          + ',left=' + left
          + ',width=' + Math.floor(width)
          + ',height=' + Math.floor(height);

        var win = window.open(e.target.href, 'WMES_LAYOUT', windowFeatures);

        if (win)
        {
          win.focus();
        }
        else
        {
          window.location.href = e.target.href;
        }

        return false;
      }
    }

  });

  NavbarView.DEFAULT_OPTIONS = {
    /**
     * @type {string}
     */
    currentPath: '/',
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
    connectingStatusClassName: 'navbar-status-connecting',
    /**
     * @type {object.<string, boolean>}
     */
    loadedModules: {}
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

    /**
     * @private
     * @type {string}
     */
    this.lastSearchPhrase = '';

    this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath));
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
    this.hideEmptyEntries();

    this.broker.publish('navbar.rendered', {
      view: this
    });
  };

  NavbarView.prototype.serialize = function()
  {
    return {
      idPrefix: this.idPrefix,
      user: user
    };
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
    t.reload(newLocale);
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
   * @param {HTMLLIElement} liEl
   * @param {boolean} useAnchor
   * @param {boolean} [clientModule]
   * @returns {string|null}
   */
  NavbarView.prototype.getModuleNameFromLi = function(liEl, useAnchor, clientModule)
  {
    var module = liEl.dataset[clientModule ? 'clientModule' : 'module'];

    if (module === undefined && !useAnchor)
    {
      return null;
    }

    if (module)
    {
      return module;
    }

    var aEl = liEl.querySelector('a');

    if (!aEl)
    {
      return null;
    }

    var href = aEl.getAttribute('href');

    if (!href)
    {
      return null;
    }

    return this.getModuleNameFromPath(href);
  };

  /**
   * @private
   * @param {string} path
   * @returns {string}
   */
  NavbarView.prototype.getModuleNameFromPath = function(path)
  {
    if (path[0] === '/' || path[0] === '#')
    {
      path = path.substr(1);
    }

    if (path === '')
    {
      return '';
    }

    var matches = path.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);

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

    if (!$newActiveNavItem && viewport.currentPage && viewport.currentPage.navbarModuleName)
    {
      $newActiveNavItem = this.navItems[viewport.currentPage.navbarModuleName];
    }

    if (!$newActiveNavItem)
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
      var moduleName = this.getModuleNameFromLi($navItem[0], true, true);

      this.navItems[moduleName] = $navItem;
    }
    else if ($navItem.hasClass('dropdown'))
    {
      var view = this;

      $navItem.find('.dropdown-menu > li').each(function()
      {
        var moduleName = view.getModuleNameFromLi(this, true, true);

        view.navItems[moduleName] = $navItem;
      });
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.hideNotAllowedEntries = function()
  {
    var navbarView = this;
    var userLoggedIn = user.isLoggedIn();
    var dropdownHeaders = [];
    var dividers = [];

    this.$('.navbar-nav > li').each(function()
    {
      var $li = navbarView.$(this);

      if (!checkSpecial($li))
      {
        $li[0].style.display = isEntryVisible($li) && hideChildEntries($li) ? '' : 'none';
      }
    });

    dropdownHeaders.forEach(function($li)
    {
      $li[0].style.display = navbarView.hasVisibleSiblings($li, 'next') ? '' : 'none';
    });

    dividers.forEach(function($li)
    {
      $li[0].style.display = navbarView.hasVisibleSiblings($li, 'prev') && navbarView.hasVisibleSiblings($li, 'next')
        ? '' : 'none';
    });

    this.$('.btn[data-privilege]').each(function()
    {
      this.style.display = user.isAllowedTo.apply(user, this.dataset.privilege.split(' ')) ? '' : 'none';
    });

    function hideChildEntries($parentLi)
    {
      if (!$parentLi.hasClass('dropdown'))
      {
        return true;
      }

      var anyVisible = true;

      $parentLi.find('> .dropdown-menu > li').each(function()
      {
        var $li = $parentLi.find(this);

        if (!checkSpecial($li))
        {
          var entryVisible = isEntryVisible($li) && hideChildEntries($li);

          $li[0].style.display = entryVisible ? '' : 'none';

          anyVisible = anyVisible || entryVisible;
        }
      });

      return anyVisible;
    }

    function checkSpecial($li)
    {
      if ($li.hasClass('divider'))
      {
        dividers.push($li);

        return true;
      }

      if ($li.hasClass('dropdown-header'))
      {
        dropdownHeaders.push($li);

        return true;
      }

      return false;
    }

    function isEntryVisible($li)
    {
      var loggedIn = $li.attr('data-loggedin');

      if (typeof loggedIn === 'string')
      {
        loggedIn = loggedIn !== '0';

        if (loggedIn !== userLoggedIn)
        {
          return false;
        }
      }

      var moduleName = navbarView.getModuleNameFromLi($li[0], false);

      if (moduleName !== null
        && $li.attr('data-no-module') === undefined
        && !navbarView.options.loadedModules[moduleName])
      {
        return false;
      }

      var privilege = $li.attr('data-privilege');

      return privilege === undefined || user.isAllowedTo.apply(user, privilege.split(' '));
    }
  };

  /**
   * @private
   * @param {jQuery} $li
   * @param {string} dir
   * @returns {boolean}
   */
  NavbarView.prototype.hasVisibleSiblings = function($li, dir)
  {
    var $siblings = $li[dir + 'All']().filter(function() { return this.style.display !== 'none'; });

    if (!$siblings.length)
    {
      return false;
    }

    var $sibling = $siblings.first();

    return !$sibling.hasClass('divider');
  };

  /**
   * @private
   */
  NavbarView.prototype.hideEmptyEntries = function()
  {
    var navbarView = this;

    this.$('.dropdown > .dropdown-menu').each(function()
    {
      var $dropdownMenu = navbarView.$(this);
      var visible = false;

      $dropdownMenu.children().each(function()
      {
        visible = visible || this.style.display !== 'none';
      });

      if (!visible)
      {
        $dropdownMenu.parent()[0].style.display = 'none';
      }
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
      var $li = navbarView.$(this);

      if (typeof $li.attr('data-disabled') !== 'undefined')
      {
        return $li.addClass('disabled');
      }

      switch ($li.attr('data-online'))
      {
        case 'show':
          $li[0].style.display = online ? '' : 'none';
          break;

        case 'hide':
          $li[0].style.display = online ? 'none' : '';
          break;

        default:
          $li[online ? 'removeClass' : 'addClass']('disabled');
          break;
      }
    });
  };

  /**
   * @private
   */
  NavbarView.prototype.handleSearch = function()
  {
    var $searchPhrase = this.$id('searchPhrase');
    var searchPhrase = $searchPhrase.val().trim();

    if (searchPhrase !== this.lastSearchPhrase)
    {
      var results = this.parseSearchPhrase(searchPhrase);

      this.$id('searchResults').replaceWith(renderSearchResults({
        idPrefix: this.idPrefix,
        results: results
      }));

      var $last = this.$id('searchResults').children().last();

      if ($last.hasClass('divider'))
      {
        $last.remove();
      }

      this.lastSearchPhrase = searchPhrase;

      if (results.searchName)
      {
        this.scheduleUserSearch(results.searchName);
      }
    }

    this.showNoSearchResults(searchPhrase);
    this.showSearchResults();
  };

  /**
   * @private
   * @param {string} searchPhrase
   */
  NavbarView.prototype.showNoSearchResults = function(searchPhrase)
  {
    if (!this.$('.navbar-search-result').length)
    {
      this.$id('searchResults').html(
        '<li class="disabled"><a>'
        + t('core', 'NAVBAR:SEARCH:' + (searchPhrase === '' ? 'help' : 'empty'))
        + '</a></li>'
      );
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.showSearchResults = function()
  {
    var $search = this.$id('search');

    $search.find('.active').removeClass('active');
    $search.find('.navbar-search-result').first().addClass('active');
    $search.addClass('open');
  };

  /**
   * @private
   */
  NavbarView.prototype.hideSearchResults = function()
  {
    this.$id('search').removeClass('open').find('.active').removeClass('active');

    if (document.activeElement === this.$id('searchPhrase')[0])
    {
      this.$id('searchPhrase').blur();
    }
  };

  /**
   * @private
   */
  NavbarView.prototype.selectPrevSearchResult = function()
  {
    var $searchResults = this.$('.navbar-search-result');

    if (!$searchResults.length)
    {
      return;
    }

    var $prev = $searchResults.filter('.active').removeClass('active');
    var i = $searchResults.length - 1;

    for (; i >= 0; --i)
    {
      var searchResultEl = $searchResults[i];

      if (searchResultEl === $prev[0])
      {
        break;
      }
    }

    if (i === 0)
    {
      $prev = $searchResults.last();
    }
    else
    {
      $prev = $searchResults.eq(i - 1);
    }

    $prev.addClass('active');
  };

  /**
   * @private
   */
  NavbarView.prototype.selectNextSearchResult = function()
  {
    var $searchResults = this.$('.navbar-search-result');

    if (!$searchResults.length)
    {
      return;
    }

    var $next = $searchResults.filter('.active').removeClass('active');
    var i = 0;

    for (; i < $searchResults.length; ++i)
    {
      var searchResultEl = $searchResults[i];

      if (searchResultEl === $next[0])
      {
        break;
      }
    }

    if (i === $searchResults.length - 1)
    {
      $next = $searchResults.first();
    }
    else
    {
      $next = $searchResults.eq(i + 1);
    }

    $next.addClass('active');
  };

  /**
   * @private
   */
  NavbarView.prototype.selectActiveSearchResult = function()
  {
    var page = this;
    var $link = page.$id('searchResults').find('.active').find('a');
    var target = $link.prop('target');
    var href = $link.prop('href');

    if (!href)
    {
      return;
    }

    if (target === '_blank')
    {
      window.open(href, target);

      return;
    }

    var onSuccess;
    var onFailure;

    onSuccess = page.broker.subscribe('viewport.page.shown', function()
    {
      onSuccess.cancel();
      onFailure.cancel();
      page.hideSearchResults();
    });
    onFailure = page.broker.subscribe('viewport.page.loadingFailed', function()
    {
      onSuccess.cancel();
      onFailure.cancel();
    });

    window.location.href = href;
  };

  /**
   * @private
   * @param {string} searchPhrase
   * @returns {Object}
   */
  NavbarView.prototype.parseSearchPhrase = function(searchPhrase)
  {
    var results = {
      fullOrderNo: null,
      partialOrderNo: null,
      fullNc12: null,
      partialNc12: null,
      fullNc15: null,
      entryId: null,
      year: null,
      month: null,
      day: null,
      shift: null,
      from: null,
      to: null,
      fromShift: null,
      toShift: null,
      shiftStart: null,
      shiftEnd: null,
      division: null,
      searchName: null
    };
    var matches;

    searchPhrase = ' ' + searchPhrase.toUpperCase() + ' ';

    // Division
    Object.keys(DIVISIONS).forEach(function(pattern)
    {
      if (searchPhrase.indexOf(pattern) !== -1)
      {
        results.division = DIVISIONS[pattern];
        searchPhrase = searchPhrase.replace(pattern, '');
      }
    });

    // Full 15NC
    matches = searchPhrase.match(/[^0-9A-Z]([0-9]{15})[^0-9A-Z]/);

    if (matches)
    {
      results.fullNc15 = matches[1];
      searchPhrase = searchPhrase.replace(results.fullNc15, '');
    }

    // Full 12NC
    matches = searchPhrase.match(/[^0-9A-Z]([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})[^0-9A-Z]/);

    if (matches && (matches[1].length === 12 || /[0-9]+/.test(matches[1])))
    {
      results.fullNc12 = matches[1].toUpperCase();
      searchPhrase = searchPhrase.replace(/([0-9]{12}|[A-Z]{2}[A-Z0-9]{5})/g, '');
    }

    // Full order no
    matches = searchPhrase.match(/[^0-9](1[0-9]{8})[^0-9]/);

    if (matches)
    {
      results.fullOrderNo = matches[1];

      if (/^1111/.test(matches[1]))
      {
        results.partialNc12 = matches[1];
      }

      searchPhrase = searchPhrase.replace(/(1[0-9]{8})/g, '');
    }

    // Shift
    matches = searchPhrase.match(/[^A-Z0-9](I{1,3})[^A-Z0-9]/);

    if (matches)
    {
      results.shift = matches[1].toUpperCase() === 'I' ? 1 : matches[1].toUpperCase() === 'II' ? 2 : 3;
      searchPhrase = searchPhrase.replace(/I{1,3}/g, '');
    }

    // Date
    matches = searchPhrase.match(/[^0-9]([0-9]{1,4})[^0-9]([0-9]{1,4})(?:[^0-9]([0-9]{1,4}))?[^0-9]/);

    var moment = null;
    var interval = 'days';

    if (matches)
    {
      results.month = +matches[2];

      if (matches[1].length === 4)
      {
        interval = 'months';
        results.year = +matches[1];
        results.day = +matches[3] || 1;
      }
      else if (!matches[3] && matches[2].length === 4)
      {
        interval = 'months';
        results.year = +matches[2];
        results.month = +matches[1];
        results.day = 1;
      }
      else if (matches[3] && matches[3].length === 4)
      {
        results.day = +matches[1];
        results.year = +matches[3];
      }
      else if (!matches[3])
      {
        results.day = +matches[1];
        results.year = +time.format(Date.now(), 'YYYY');
      }
      else
      {
        results.day = +matches[1];
        results.year = parseInt(matches[3], 10) + 2000;
      }

      searchPhrase = searchPhrase.replace(/[0-9]{1,4}[^0-9][0-9]{1,4}([^0-9][0-9]{1,4})?/g, '');

      moment = time.getMoment(results.year + '-' + results.month + '-' + results.day, 'YYYY-MM-DD');
    }

    if (!moment && results.shift)
    {
      moment = time.getMoment(Date.now()).startOf('day');
      results.year = moment.year();
      results.month = moment.month();
      results.day = moment.day();
    }

    if (moment && moment.isValid())
    {
      results.from = moment.valueOf();
      results.fromShift = moment.hours(6).valueOf();
      results.shiftStart = results.fromShift + 8 * 3600 * 1000 * ((results.shift || 1) - 1);
      results.toShift = moment.add(1, interval).valueOf();
      results.shiftEnd = results.shift ? (results.shiftStart + 8 * 3600 * 1000) : results.toShift;
      results.to = moment.startOf('day').valueOf();
    }
    else
    {
      results.year = null;
      results.month = null;
      results.day = null;
    }

    // User name
    var searchName = setUpUserSelect2.transliterate(searchPhrase);

    matches = searchName.match(/([A-Z]{3,})/);

    if (!results.division && matches)
    {
      results.searchName = matches[1];
    }

    // Partial order no and/or 12NC
    matches = searchPhrase.match(/([0-9]+)/);

    if (matches)
    {
      if (/^1[0-9]*$/.test(matches[1]) && matches[1].length < 9)
      {
        results.partialOrderNo = matches[1];
      }

      if (/^[0-9]{1,6}$/.test(matches[1]))
      {
        results.entryId = matches[1];
      }

      if (matches[1].length < 12)
      {
        results.partialNc12 = matches[1].toUpperCase();
      }
    }

    if (results.fullOrderNo && results.partialOrderNo)
    {
      results.partialOrderNo = null;
    }

    if (results.fullNc12 && results.partialNc12)
    {
      results.partialNc12 = null;
    }

    return results;
  };

  /**
   * @private
   */
  NavbarView.prototype.showMor = function()
  {
    if (viewport.currentPage.pageId === 'mor')
    {
      return;
    }

    var $mor = this.$id('mor').addClass('disabled');

    $mor.find('.fa').removeClass('fa-group').addClass('fa-spinner fa-spin');

    var morView = new MorView({
      model: new Mor()
    });

    morView.model.fetch()
      .done(function()
      {
        viewport.showDialog(morView);
      })
      .always(function()
      {
        $mor.removeClass('disabled').find('.fa').removeClass('fa-spinner fa-spin').addClass('fa-group');
      });
  };

  /**
   * @private
   * @param {string} searchName
   */
  NavbarView.prototype.scheduleUserSearch = function(searchName)
  {
    if (this.timers.searchUsers)
    {
      clearTimeout(this.timers.searchUsers);
    }

    this.timers.searchUsers = setTimeout(this.searchUsers.bind(this, searchName), 300);
  };

  /**
   * @private
   * @param {string} searchName
   */
  NavbarView.prototype.searchUsers = function(searchName)
  {
    var view = this;

    if (view.searchUsersReq)
    {
      view.searchUsersReq.abort();
    }

    var req = view.searchUsersReq = this.ajax({
      url: '/users?limit(20)&searchName=regex=' + encodeURIComponent('^' + searchName)
    });

    req.done(function(res)
    {
      var $hd = view.$id('searchName');
      var $tpl = $hd.next().detach();

      $tpl.removeClass('active').find('.fa').remove();

      var users = setUpUserSelect2.filterDuplicates(res.collection);

      if (users.length === 0)
      {
        $hd.remove();

        view.showNoSearchResults(searchName);

        return;
      }

      users.slice(0, 5).reverse().forEach(function(user)
      {
        var $user = $tpl.clone();

        $user.find('a').attr('href', '#users/' + user._id).text(user.lastName + ' ' + user.firstName);

        $user.insertAfter($hd);
      });

      $hd.next().addClass('active').focus();
    });

    req.fail(function()
    {
      view.$id('searchName').find('.fa-spin').removeClass('.fa-spin');
    });

    req.always(function()
    {
      if (req === view.searchUsersReq)
      {
        view.searchUsersReq = null;
      }
    });
  };

  return NavbarView;
});
