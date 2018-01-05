// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/broker',
  'app/socket',
  'app/viewport',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/core/pages/ErrorPage',
  'app/users/pages/LogInFormPage'
],
function(
  _,
  t,
  broker,
  socket,
  viewport,
  divisions,
  subdivisions,
  ErrorPage,
  LogInFormPage
) {
  'use strict';

  var user = {};

  socket.on('user.reload', function(userData)
  {
    user.reload(userData);
  });

  socket.on('user.deleted', function()
  {
    window.location.reload();
  });

  user.data = _.extend(window.GUEST_USER || {}, {
    name: t.bound('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  user.noReload = false;

  /**
   * @param {Object} userData
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

      if (userData.orgUnitType === 'unspecified')
      {
        userData.orgUnitType = null;
        userData.orgUnitId = null;
      }

      user.data = userData;
    }

    user.data.privilegesMap = null;

    if (user.noReload)
    {
      user.noReload = false;
    }
    else
    {
      broker.publish('user.reloaded');
    }

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
   * @param {boolean} [firstNameFirst]
   * @returns {string}
   */
  user.getLabel = function(firstNameFirst)
  {
    if (user.data.name)
    {
      return String(user.data.name);
    }

    if (user.data.lastName && user.data.firstName)
    {
      if (firstNameFirst)
      {
        return user.data.firstName + ' ' + user.data.lastName;
      }

      return user.data.lastName + ' ' + user.data.firstName;
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
      cname: window.COMPUTERNAME,
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

    var isLoggedIn = user.isLoggedIn();

    if (!anyPrivileges.length)
    {
      return isLoggedIn;
    }

    for (var i = 0, l = anyPrivileges.length; i < l; ++i)
    {
      var allPrivileges = anyPrivileges[i];
      var actualMatches = 0;
      var requiredMatches = allPrivileges.length;

      for (var ii = 0; ii < requiredMatches; ++ii)
      {
        var requiredPrivilege = allPrivileges[ii];

        if (requiredPrivilege === 'USER')
        {
          actualMatches += isLoggedIn ? 1 : 0;
        }
        else if (/^FN:/.test(requiredPrivilege))
        {
          actualMatches += user.data.prodFunction === requiredPrivilege.substring(3) ? 1 : 0;
        }
        else
        {
          actualMatches += user.hasPrivilege(allPrivileges[ii]) ? 1 : 0;
        }
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

  user.hasAccessToSubdivision = function(subdivisionId)
  {
    if (!subdivisionId)
    {
      return true;
    }

    if (user.data.orgUnitType === 'division')
    {
      var subdivision = subdivisions.get(subdivisionId);

      return subdivision && user.data.orgUnitId === subdivision.get('division');
    }

    if (user.data.orgUnitType === 'subdivision')
    {
      return user.data.orgUnitId === subdivisionId;
    }

    return true;
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
      else if (!user.isLoggedIn())
      {
        viewport.showPage(new LogInFormPage());
      }
      else
      {
        require(['app/core/pages/ErrorPage'], function(ErrorPage)
        {
          viewport.showPage(new ErrorPage({
            model: {
              code: 403,
              req: req,
              previousUrl: referer
            }
          }));
        });
      }
    };
  };

  user.getDivision = function()
  {
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

  user.hasPrivilege = function(privilege)
  {
    if (!user.data.privilegesMap)
    {
      if (!Array.isArray(user.data.privileges))
      {
        user.data.privileges = [];
      }

      user.data.privilegesString = '|' + user.data.privileges.join('|');
      user.data.privilegesMap = {};

      _.forEach(user.data.privileges, function(privilege) { user.data.privilegesMap[privilege] = true; });
    }

    if (privilege.charAt(privilege.length - 1) === '*')
    {
      return user.data.privilegesString.indexOf('|' + privilege.substr(0, privilege.length - 1)) !== -1;
    }

    return user.data.privilegesMap[privilege] === true;
  };

  user.getGuestUserData = function()
  {
    return window.GUEST_USER || {
      id: null,
      login: 'guest',
      name: t.bound('core', 'GUEST_USER_NAME'),
      loggedIn: false,
      super: false,
      privileges: []
    };
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

  user.can = {
    commentOrders: function()
    {
      return user.isAllowedTo(
        'ORDERS:MANAGE',
        'PLANNING:PLANNER', 'PLANNING:WHMAN', 'PAINT_SHOP:PAINTER',
        'FN:master', 'FN:leader'
      );
    }
  };

  window.user = user;

  return user;
});
