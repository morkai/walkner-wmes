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

  var css = 'css!app/opinionSurveys/assets/main';
  var nls = 'i18n!app/nls/opinionSurveys';
  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyReport', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveys/pages/OpinionSurveyReportPage',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(OpinionSurveyReportPage)
      {
        return new OpinionSurveyReportPage({
          query: req.query
        });
      }
    );
  });

  router.map('/opinionSurveys', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/opinionSurveys/OpinionSurveyCollection',
        'app/opinionSurveys/views/OpinionSurveyListView',
        nls
      ],
      function(ListPage, OpinionSurveyCollection, OpinionSurveyListView)
      {
        return new ListPage({
          baseBreadcrumb: true,
          ListView: OpinionSurveyListView,
          collection: new OpinionSurveyCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/opinionSurveys/:id', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveys/OpinionSurvey',
        'app/opinionSurveys/pages/OpinionSurveyDetailsPage',
        css,
        nls
      ],
      function(OpinionSurvey, OpinionSurveyDetailsPage)
      {
        return new OpinionSurveyDetailsPage({
          model: new OpinionSurvey({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveys;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/opinionSurveys/OpinionSurvey',
        'app/opinionSurveys/pages/OpinionSurveyAddFormPage',
        css,
        nls
      ],
      function(OpinionSurvey, OpinionSurveyAddFormPage)
      {
        return new OpinionSurveyAddFormPage({
          model: new OpinionSurvey()
        });
      }
    );
  });

  router.map('/opinionSurveys/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveys/OpinionSurvey',
        'app/opinionSurveys/pages/OpinionSurveyEditFormPage',
        css,
        nls
      ],
      function(OpinionSurvey, OpinionSurveyEditFormPage)
      {
        return new OpinionSurveyEditFormPage({
          model: new OpinionSurvey({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveys/:id;editEmployeeCount', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveys/OpinionSurvey',
        'app/opinionSurveys/pages/EmployeeCountEditFormPage',
        css,
        nls
      ],
      function(OpinionSurvey, EmployeeCountEditFormPage)
      {
        return new EmployeeCountEditFormPage({
          model: new OpinionSurvey({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveys/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/opinionSurveys/OpinionSurvey', _, _, {
      baseBreadcrumb: true
    })
  );

  router.map('/opinionSurveys;settings', canManage, function(req)
  {
    viewport.loadPage(['app/opinionSurveys/pages/OpinionSurveySettingsPage', nls], function(OpinionSurveySettingsPage)
    {
      return new OpinionSurveySettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
