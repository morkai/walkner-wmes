// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function(app, updaterModule, req, res, next)
{
  if (!updaterModule.restarting)
  {
    return next();
  }

  var restartDelay = updaterModule.config.restartDelay
    - (Date.now() - updaterModule.restarting)
    + 5000;

  res.status(503).format({
    text: function()
    {
      res.send(
        "503 - Service Unavailable - Restarting... try again in "
          + Math.ceil(restartDelay / 1000) + "s"
      );
    },
    html: function()
    {
      res.render(updaterModule.config.errorTemplate, {
        restartDelay: restartDelay
      });
    },
    json: function()
    {
      res.send({
        error: {message: '503'},
        restartDelay: restartDelay
      });
    }
  });
};
