define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/broker',
  'app/socket',
  'app/core/pages/ErrorPage'
],
function(
  $,
  _,
  t,
  broker,
  socket,
  ErrorPage
) {
  'use strict';

  var user = {};

  socket.on('user.reload', function(userData)
  {
    user.reload(userData);
  });

  user.data = _.extend(window.GUEST_USER || {}, {
    name: t('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  /**
   * @param {object} userData
   */
  user.reload = function(userData)
  {
    var wasLoggedIn = user.isLoggedIn();

    if (_.isObject(userData) && Object.keys(userData).length > 0)
    {
      if (userData.loggedIn === false)
      {
        userData.name = t('core', 'GUEST_USER_NAME');
      }

      user.data = userData;
    }

    broker.publish('user.reloaded');

    if (wasLoggedIn && !user.isLoggedIn())
    {
      broker.publish('user.loggedOut');
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
   * @param {string|Array.<string>} [privilege]
   * @returns {boolean}
   */
  user.isAllowedTo = function(privilege)
  {
    if (user.data.super)
    {
      return true;
    }

    var userPrivileges = user.data.privileges;

    if (!userPrivileges)
    {
      return false;
    }

    if (!privilege || privilege.length === 0)
    {
      return user.isLoggedIn();
    }

    var privileges = [].concat(privilege);
    var matches = 0;

    for (var i = 0, l = privileges.length; i < l; ++i)
    {
      privilege = privileges[i];

      if (typeof privilege !== 'string')
      {
        continue;
      }

      var privilegeRe = new RegExp('^' + privilege.replace('*', '.*?') + '$');

      for (var ii = 0, ll = userPrivileges.length; ii < ll; ++ii)
      {
        if (privilegeRe.test(userPrivileges[ii]))
        {
          ++matches;

          break;
        }
      }
    }

    return matches === privileges.length;
  };

  /**
   * @param {string|Array.<string>} privilege
   * @returns {function(app.core.Router, string, function)}
   */
  user.auth = function(privilege)
  {
    return function(req, referer, next)
    {
      if (user.isAllowedTo(privilege))
      {
        next();
      }
      else
      {
        new ErrorPage({code: 401, req: req, referer: referer}).render();
      }
    };
  };

  window.user = user;

  return user;
});
