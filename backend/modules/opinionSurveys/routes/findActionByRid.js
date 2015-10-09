// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function findActionByRidRoute(app, module, req, res, next)
{
  var mongoose = app[module.config.mongooseId];
  var OpinionSurveyAction = mongoose.model('OpinionSurveyAction');

  var rid = parseInt(req.query.rid, 10);

  if (isNaN(rid) || rid <= 0)
  {
    return res.sendStatus(400);
  }

  OpinionSurveyAction.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, action)
  {
    if (err)
    {
      return next(err);
    }

    if (action)
    {
      return res.json(action._id);
    }

    return res.sendStatus(404);
  });
};
