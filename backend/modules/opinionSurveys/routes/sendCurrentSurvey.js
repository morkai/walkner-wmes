// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var moment = require('moment');

module.exports = function sendCurrentSurveyRoute(app, module, req, res, next)
{
  var mongoose = app[module.config.mongooseId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');

  var currentDate = moment().startOf('day').toDate();
  var currentSurvey = null;

  step(
    function findCurrentSurveyStep()
    {
      var conditions = {
        startDate: {$lte: currentDate},
        endDate: {$gte: currentDate}
      };

      OpinionSurvey.findOne(conditions).sort({startDate: -1}).lean().exec(this.next());
    },
    function findNextSurveyStep(err, survey)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (survey)
      {
        currentSurvey = survey;

        return;
      }

      OpinionSurvey.findOne({startDate: {$gte: currentDate}}).sort({startDate: 1}).lean().exec(this.next());
    },
    function sendCurrentSurveyStep(err, nextSurvey)
    {
      if (err)
      {
        return next(err);
      }

      res.format({
        json: function()
        {
          if (currentSurvey)
          {
            res.send(currentSurvey);
          }
          else
          {
            res.sendStatus(404);
          }
        },
        html: function()
        {
          if (currentSurvey)
          {
            res.render('opinionSurveys:current', {
              cache: false,
              moment: moment,
              survey: currentSurvey
            });
          }
          else
          {
            res.render('opinionSurveys:closed', {
              cache: false,
              moment: moment,
              survey: nextSurvey
            });
          }
        }
      });
    }
  );
};
