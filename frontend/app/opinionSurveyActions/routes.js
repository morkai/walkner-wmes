// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/opinionSurveyActions/assets/main';
  var nls = 'i18n!app/nls/opinionSurveyActions';
  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE', 'FN:manager', 'FN:master');

  router.map('/opinionSurveyActions', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyActions/OpinionSurveyActionCollection',
        'app/opinionSurveyActions/pages/OpinionSurveyActionListPage',
        css,
        nls
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
        'app/opinionSurveyActions/OpinionSurveyAction',
        'app/opinionSurveyActions/pages/OpinionSurveyActionDetailsPage',
        css,
        nls
      ],
      function(OpinionSurveyAction, OpinionSurveyActionDetailsPage)
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
        'app/opinionSurveyActions/OpinionSurveyAction',
        'app/opinionSurveyActions/pages/OpinionSurveyActionAddFormPage',
        css,
        nls
      ],
      function(OpinionSurveyAction, OpinionSurveyActionAddFormPage)
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
        'app/opinionSurveyActions/OpinionSurveyAction',
        'app/opinionSurveyActions/pages/OpinionSurveyActionEditFormPage',
        css,
        nls
      ],
      function(OpinionSurveyAction, OpinionSurveyActionEditFormPage)
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
    _.partial(showDeleteFormPage, 'app/opinionSurveyActions/OpinionSurveyAction', _, _, {
      baseBreadcrumb: true
    })
  );
});
