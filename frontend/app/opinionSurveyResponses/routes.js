// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyResponseCollection',
  './OpinionSurveyResponse',
  './pages/OpinionSurveyResponseListPage',
  './pages/OpinionSurveyResponseDetailsPage',
  './pages/OpinionSurveyResponseAddFormPage',
  './pages/OpinionSurveyResponseEditFormPage',
  'i18n!app/nls/opinionSurveyResponses'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyResponseCollection,
  OpinionSurveyResponse,
  OpinionSurveyResponseListPage,
  OpinionSurveyResponseDetailsPage,
  OpinionSurveyResponseAddFormPage,
  OpinionSurveyResponseEditFormPage
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyResponses', canView, function(req)
  {
    viewport.showPage(new OpinionSurveyResponseListPage({
      collection: new OpinionSurveyResponseCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/opinionSurveyResponses/:id', canView, function(req)
  {
    viewport.showPage(new OpinionSurveyResponseDetailsPage({
      model: new OpinionSurveyResponse({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveyResponses;add', canManage, function(req)
  {
    viewport.showPage(new OpinionSurveyResponseAddFormPage({
      model: new OpinionSurveyResponse(),
      fix: req.query.fix
    }));
  });

  router.map('/opinionSurveyResponses/:id;edit', canManage, function(req)
  {
    viewport.showPage(new OpinionSurveyResponseEditFormPage({
      model: new OpinionSurveyResponse({_id: req.params.id}),
      fixing: !!req.query.fix
    }));
  });

  router.map(
    '/opinionSurveyResponses/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyResponse, _, _, {
      baseBreadcrumb: true
    })
  );

});
