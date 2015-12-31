// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
