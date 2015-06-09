// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function deleteProgramRoute(app, XiconfProgram, req, res, next)
{
  XiconfProgram.findById(req.params.id).exec(function(err, program)
  {
    if (err)
    {
      return next(err);
    }

    program.deleted = true;
    program.updatedAt = new Date();

    program.save(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      app.broker.publish(XiconfProgram.TOPIC_PREFIX + '.deleted', {
        model: program,
        user: req.session.user
      });
    });
  });
};
