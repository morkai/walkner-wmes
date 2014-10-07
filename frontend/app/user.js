// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/broker',
  'app/socket',
  'app/viewport',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/core/pages/ErrorPage'
],
function(
  _,
  t,
  broker,
  socket,
  viewport,
  divisions,
  subdivisions,
  ErrorPage
) {
  'use strict';

  var computerName = null;

  if (window.location.search.indexOf('COMPUTERNAME=') !== -1)
  {
    window.location.search.substr(1).split('&').forEach(function(keyValue)
    {
      keyValue = keyValue.split('=');

      if (keyValue[0] === 'COMPUTERNAME' && keyValue[1])
      {
        computerName = keyValue[1];
      }
    });
  }

  var user = {};

  socket.on('user.reload', function(userData)
  {
    user.reload(userData);
  });

  user.data = _.extend(window.GUEST_USER || {}, {
    name: t.bound('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  /**
   * @param {object} userData
   */
  user.reload = function(userData)
  {
    if (_.isEqual(userData, user.data))
    {
      return;
    }

    var wasLoggedIn = user.isLoggedIn();

    if (_.isObject(userData) && Object.keys(userData).length > 0)
    {
      if (userData.loggedIn === false)
      {
        userData.name = t.bound('core', 'GUEST_USER_NAME');
      }

      user.data = userData;
    }

    broker.publish('user.reloaded');

    if (wasLoggedIn && !user.isLoggedIn())
    {
      broker.publish('user.loggedOut');
    }
    else if (!wasLoggedIn && user.isLoggedIn())
    {
      broker.publish('user.loggedIn');
    }
  };

  /**
   * @returns {boolean}
   */
  user.isLoggedIn = function()
  {
    return user.data.loggedIn === true;
  };

  /**
   * @returns {string}
   */
  user.getLabel = function()
  {
    if (user.data.name)
    {
      return String(user.data.name);
    }

    if (user.data.lastName && user.data.firstName)
    {
      return user.data.firstName + ' ' + user.data.lastName;
    }

    return user.data.login;
  };

  /**
   * @returns {{id: string, label: string, ip: string, cname: string}}
   */
  user.getInfo = function()
  {
    return {
      id: user.data._id,
      ip: user.data.ip || user.data.ipAddress || '0.0.0.0',
      cname: computerName,
      label: user.getLabel()
    };
  };

  user.isAllowedTo = function(privilege)
  {
    if (user.data.super)
    {
      return true;
    }

    var userPrivileges = user.data.privileges;
    var anyPrivileges = (arguments.length === 1 ? [privilege] : Array.prototype.slice.call(arguments)).map(function(p)
    {
      return Array.isArray(p) ? p : [p];
    });

    if (anyPrivileges.length
      && user.data.local
      && anyPrivileges[0].some(function(privilege) { return privilege === 'LOCAL'; }))
    {
      return true;
    }

    if (!userPrivileges)
    {
      return false;
    }

    if (!anyPrivileges.length)
    {
      return user.isLoggedIn();
    }

    for (var i = 0, l = anyPrivileges.length; i < l; ++i)
    {
      var allPrivileges = anyPrivileges[i];
      var actualMatches = 0;
      var requiredMatches = allPrivileges.length;

      for (var ii = 0; ii < requiredMatches; ++ii)
      {
        actualMatches += userPrivileges.indexOf(allPrivileges[ii]) === -1 ? 0 : 1;
      }

      if (actualMatches === requiredMatches)
      {
        return true;
      }
    }

    return false;
  };

  user.hasAccessToAor = function(aorId)
  {
    return !aorId
      || user.data.super
      || !user.data.aors
      || !user.data.aors.length
      || user.data.aors.indexOf(aorId) !== -1;
  };

  user.auth = function()
  {
    var anyPrivileges = Array.prototype.slice.call(arguments);

    return function(req, referer, next)
    {
      if (user.isAllowedTo.apply(user, anyPrivileges))
      {
        next();
      }
      else
      {
        viewport.showPage(new ErrorPage({code: 401, req: req, referer: referer}));
      }
    };
  };

  user.getDivision = function()
  {
    /*jshint -W015*/

    var divisionId = null;

    switch (user.data.orgUnitType)
    {
      case 'division':
        divisionId = user.data.orgUnitId;
        break;

      case 'subdivision':
        var subdivision = subdivisions.get(user.data.orgUnitId);

        if (subdivision)
        {
          divisionId = subdivision.get('division');
        }
        break;
    }

    return divisions.get(divisionId) || null;
  };

  user.getSubdivision = function()
  {
    if (user.data.orgUnitType !== 'subdivision')
    {
      return null;
    }

    return subdivisions.get(user.data.orgUnitId) || null;
  };

  user.getRootUserData = function()
  {
    return window.ROOT_USER || {
      id: null,
      login: 'root',
      name: 'root',
      loggedIn: true,
      super: true,
      privileges: []
    };
  };

  window.user = user;

  return user;
});
