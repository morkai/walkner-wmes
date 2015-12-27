// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyAction',
  'i18n!app/nls/opinionSurveyActions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyAction
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE', 'FN:manager', 'FN:master');

  router.map('/opinionSurveyActions', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyActions/OpinionSurveyActionCollection',
        'app/opinionSurveyActions/pages/OpinionSurveyActionListPage'
      ],
      function(OpinionSurveyActionCollection, OpinionSurveyActionListPage)
      {
        return new OpinionSurveyActionListPage({
          collection: new OpinionSurveyActionCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/opinionSurveyActions/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyActions/pages/OpinionSurveyActionDetailsPage'
      ],
      function(OpinionSurveyActionDetailsPage)
      {
        return new OpinionSurveyActionDetailsPage({
          model: new OpinionSurveyAction({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveyActions;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/opinionSurveyActions/pages/OpinionSurveyActionAddFormPage'
      ],
      function(OpinionSurveyActionAddFormPage)
      {
        return new OpinionSurveyActionAddFormPage({
          model: new OpinionSurveyAction()
        });
      }
    );
  });

  router.map('/opinionSurveyActions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyActions/pages/OpinionSurveyActionEditFormPage'
      ],
      function(OpinionSurveyActionEditFormPage)
      {
        return new OpinionSurveyActionEditFormPage({
          model: new OpinionSurveyAction({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveyActions/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyAction, _, _, {
      baseBreadcrumb: true
    })
  );

});
