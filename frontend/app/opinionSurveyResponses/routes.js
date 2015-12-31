// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyResponse'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyResponse
) {
  'use strict';

  var nls = 'i18n!app/nls/opinionSurveyResponses';
  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyResponses', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyResponses/OpinionSurveyResponseCollection',
        'app/opinionSurveyResponses/pages/OpinionSurveyResponseListPage',
        nls
      ],
      function(OpinionSurveyResponseCollection, OpinionSurveyResponseListPage)
      {
        return new OpinionSurveyResponseListPage({
          collection: new OpinionSurveyResponseCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/opinionSurveyResponses/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyResponses/OpinionSurveyResponse',
        'app/opinionSurveyResponses/pages/OpinionSurveyResponseDetailsPage',
        nls
      ],
      function(OpinionSurveyResponse, OpinionSurveyResponseDetailsPage)
      {
        return new OpinionSurveyResponseDetailsPage({
          model: new OpinionSurveyResponse({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveyResponses;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyResponses/OpinionSurveyResponse',
        'app/opinionSurveyResponses/pages/OpinionSurveyResponseAddFormPage',
        nls
      ],
      function(OpinionSurveyResponse, OpinionSurveyResponseAddFormPage)
      {
        return new OpinionSurveyResponseAddFormPage({
          model: new OpinionSurveyResponse(),
          fix: req.query.fix
        });
      }
    );
  });

  router.map('/opinionSurveyResponses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyResponses/OpinionSurveyResponse',
        'app/opinionSurveyResponses/pages/OpinionSurveyResponseEditFormPage',
        nls
      ],
      function(OpinionSurveyResponse, OpinionSurveyResponseEditFormPage)
      {
        return new OpinionSurveyResponseEditFormPage({
          model: new OpinionSurveyResponse({_id: req.params.id}),
          fixing: !!req.query.fix
        });
      }
    );
  });

  router.map(
    '/opinionSurveyResponses/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyResponse, _, _, {
      baseBreadcrumb: true
    })
  );

});
