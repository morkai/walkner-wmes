// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function(mongoose, options, done)
{
  var OpinionSurveyResponse = mongoose.model('OpinionSurveyResponse');

  var results = {
    options: options,
    superiorToSurvey: {},
    usedSurveys: {},
    usedDivisions: {},
    usedEmployers: {},
    responseCountTotal: {},
    responseCountBySurvey: {},
    responseCountBySuperior: {},
    answerCountTotal: {},
    answerCountBySurvey: {},
    answerCountBySuperior: {},
    positiveAnswerCountBySurvey: {},
    positiveAnswerCountByDivision: {}
  };

  step(
    function handleResponsesStep()
    {
      var conditions = {};

      if (!_.isEmpty(options.surveys))
      {
        conditions.survey = {$in: options.surveys};
      }

      if (!_.isEmpty(options.divisions))
      {
        conditions.division = {$in: options.divisions};
      }

      if (!_.isEmpty(options.superiors))
      {
        conditions.superior = {$in: options.superiors};
      }

      if (!_.isEmpty(options.employers))
      {
        conditions.employer = {$in: options.employers};
      }

      var stream = OpinionSurveyResponse.find(conditions).sort({createdAt: 1}).lean().stream();
      var next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleResponse);
    },
    function sortResultsStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      var sortedDivisions = Object.keys(results.usedDivisions).sort(sortDivisions);

      results.usedDivisions = {};

      _.forEach(sortedDivisions, function(division)
      {
        results.usedDivisions[division] = true;
      });
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return done(err);
      }

      return done(null, results);
    }
  );

  function handleResponse(res)
  {
    if (!res.employer || !res.division || !res.superior)
    {
      return;
    }

    results.usedSurveys[res.survey] = true;
    results.usedDivisions[res.division] = true;
    results.usedEmployers[res.employer] = true;

    countResponseTotal(res);
    countResponseBySurvey(res);
    countResponseBySuperior(res);
    countAnswers(res);
  }

  function countResponseTotal(res)
  {
    var responseCount = results.responseCountTotal;

    if (!responseCount[res.division])
    {
      responseCount[res.division] = {};
    }

    if (!responseCount[res.division][res.employer])
    {
      responseCount[res.division][res.employer] = 0;
    }

    responseCount[res.division][res.employer] += 1;
  }

  function countResponseBySurvey(res)
  {
    var responseCount = results.responseCountBySurvey[res.survey];

    if (!responseCount)
    {
      responseCount = results.responseCountBySurvey[res.survey] = {};
    }

    if (!responseCount[res.division])
    {
      responseCount[res.division] = {};
    }

    if (!responseCount[res.division][res.employer])
    {
      responseCount[res.division][res.employer] = 0;
    }

    responseCount[res.division][res.employer] += 1;
  }

  function countResponseBySuperior(res)
  {
    var responseCount = results.responseCountBySuperior;

    if (!responseCount[res.superior])
    {
      responseCount[res.superior] = {};
    }

    if (!responseCount[res.superior][res.employer])
    {
      responseCount[res.superior][res.employer] = 0;
    }

    responseCount[res.superior][res.employer] += 1;

    results.superiorToSurvey[res.superior] = res.survey;
  }

  function countAnswers(res)
  {
    _.forEach(res.answers, function(a)
    {
      var answer = a.answer === 'null' ? 'na' : a.answer;

      countAnswerTotal(a.question, answer);
      countAnswerBySurvey(res.survey, a.question, answer);
      countAnswerBySuperior(res.superior, a.question, answer);
      countPositiveAnswerBySurvey(res.survey, res.employer, answer);
      countPositiveAnswerByDivision(res.division, res.employer, answer);
    });
  }

  function countAnswerTotal(question, answer)
  {
    var answerCount = results.answerCountTotal;

    if (!answerCount[question])
    {
      answerCount[question] = {
        total: 0,
        yes: 0,
        no: 0,
        na: 0
      };
    }

    answerCount[question].total += 1;
    answerCount[question][answer] += 1;
  }

  function countAnswerBySurvey(survey, question, answer)
  {
    var answerCount = results.answerCountBySurvey;

    if (!answerCount[survey])
    {
      answerCount[survey] = {
        total: 0
      };
    }

    if (!answerCount[survey][question])
    {
      answerCount[survey][question] = {
        total: 0,
        yes: 0,
        no: 0,
        na: 0
      };
    }

    answerCount[survey].total += 1;
    answerCount[survey][question].total += 1;
    answerCount[survey][question][answer] += 1;
  }

  function countAnswerBySuperior(superior, question, answer)
  {
    var answerCount = results.answerCountBySuperior;

    if (!answerCount[superior])
    {
      answerCount[superior] = {
        total: 0
      };
    }

    if (!answerCount[superior][question])
    {
      answerCount[superior][question] = {
        total: 0,
        yes: 0,
        no: 0,
        na: 0
      };
    }

    answerCount[superior].total += 1;
    answerCount[superior][question].total += 1;
    answerCount[superior][question][answer] += 1;
  }

  function countPositiveAnswerBySurvey(survey,  employer, answer)
  {
    var answerCount = results.positiveAnswerCountBySurvey;

    if (!answerCount[survey])
    {
      answerCount[survey] = {};
    }

    if (!answerCount[survey][employer])
    {
      answerCount[survey][employer] = {
        num: 0,
        den: 0
      };
    }

    answerCount[survey][employer][answer === 'yes' ? 'num' : 'den'] += 1;
  }

  function countPositiveAnswerByDivision(division, employer, answer)
  {
    var answerCount = results.positiveAnswerCountByDivision;

    if (!answerCount[division])
    {
      answerCount[division] = {};
    }

    if (!answerCount[division][employer])
    {
      answerCount[division][employer] = {
        num: 0,
        den: 0
      };
    }

    answerCount[division][employer][answer === 'yes' ? 'num' : 'den'] += 1;
  }

  function sortDivisions(a, b)
  {
    if (a === b)
    {
      return 0;
    }

    var aMatches = a.match(/([a-z])$/);
    var bMatches = b.match(/([a-z])$/);

    if (aMatches && !bMatches)
    {
      return -1;
    }

    if (!aMatches && bMatches)
    {
      return 1;
    }

    if (!aMatches && !bMatches)
    {
      return a.localeCompare(b);
    }

    return aMatches[1].localeCompare(bMatches[1]);
  }
};
