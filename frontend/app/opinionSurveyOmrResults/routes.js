// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyOmrResultCollection',
  './OpinionSurveyOmrResult',
  'i18n!app/nls/opinionSurveyOmrResults'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyOmrResultCollection,
  OpinionSurveyOmrResult
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyOmrResults', canView, function(req)
  {
    viewport.loadPage(
      'app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultListPage',
      function(OpinionSurveyOmrResultListPage)
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
      'app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultDetailsPage',
      function(OpinionSurveyOmrResultDetailsPage)
      {
        return new OpinionSurveyOmrResultDetailsPage({
          model: new OpinionSurveyOmrResult({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveyOmrResults/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      'app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultEditFormPage',
      function(OpinionSurveyOmrResultEditFormPage)
      {
        return new OpinionSurveyOmrResultEditFormPage({
          model: new OpinionSurveyOmrResult({_id: req.params.id})
        });
      }
    );
  });

});
