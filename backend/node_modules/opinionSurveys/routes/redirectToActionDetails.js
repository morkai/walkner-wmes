// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function redirectToActionDetailsRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const OpinionSurveyAction = mongoose.model('OpinionSurveyAction');

  OpinionSurveyAction.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, action)
  {
    if (err)
    {
      return next(err);
    }

    if (action)
    {
      return res.redirect('/#opinionSurveyActions/' + action._id);
    }

    return res.sendStatus(404);
  });
};
