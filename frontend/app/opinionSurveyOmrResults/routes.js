// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user'
], function(
  _,
  router,
  viewport,
  user
) {
  'use strict';

  var nls = 'i18n!app/nls/opinionSurveyOmrResults';
  var canView = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyOmrResults', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyOmrResults/OpinionSurveyOmrResultCollection',
        'app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultListPage',
        nls
      ],
      function(OpinionSurveyOmrResultCollection, OpinionSurveyOmrResultListPage)
      {
        return new OpinionSurveyOmrResultListPage({
          collection: new OpinionSurveyOmrResultCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/opinionSurveyOmrResults/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyOmrResults/OpinionSurveyOmrResult',
        'app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultDetailsPage',
        nls
      ],
      function(OpinionSurveyOmrResult, OpinionSurveyOmrResultDetailsPage)
      {
        return new OpinionSurveyOmrResultDetailsPage({
          model: new OpinionSurveyOmrResult({_id: req.params.id})
        });
      }
    );
  });

});
