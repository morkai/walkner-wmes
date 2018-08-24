// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function(app, module, req, res, next)
{
  const userModule = app[module.config.userId];

  const oldSessionId = req.sessionID;
  const user = _.defaults({}, req.user, userModule.guest);

  req.session.regenerate(err =>
  {
    if (err)
    {
      return next(err);
    }

    delete user.password;

    user._id = user._id.toString();
    user.loggedIn = true;
    user.ipAddress = userModule.getRealIp({}, req);
    user.local = userModule.isLocalIpAddress(user.ipAddress);
    user.super = _.includes(user.privileges, 'SUPER');

    req.session.user = user;

    const returnUrl = req.cookies['users.returnUrl'];

    res.clearCookie('users.returnUrl');

    if (returnUrl)
    {
      res.redirect(returnUrl);
    }
    else
    {
      res.format({
        json: function()
        {
          res.send(user);
        },
        default: function()
        {
          res.redirect('/');
        }
      });
    }

    app.broker.publish('users.login', {
      user: user,
      oldSessionId: oldSessionId,
      newSessionId: req.sessionID,
      socketId: req.body.socketId
    });
  });
};
