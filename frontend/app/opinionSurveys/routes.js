// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../core/pages/ListPage',
  './OpinionSurveyCollection',
  './OpinionSurvey',
  './pages/OpinionSurveyDetailsPage',
  './pages/OpinionSurveyAddFormPage',
  './pages/OpinionSurveyEditFormPage',
  './pages/EmployeeCountEditFormPage',
  './views/OpinionSurveyListView',
  'i18n!app/nls/reports',
  'i18n!app/nls/opinionSurveys'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  ListPage,
  OpinionSurveyCollection,
  OpinionSurvey,
  OpinionSurveyDetailsPage,
  OpinionSurveyAddFormPage,
  OpinionSurveyEditFormPage,
  EmployeeCountEditFormPage,
  OpinionSurveyListView
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyReport', canView, function(req)
  {
    viewport.loadPage('app/opinionSurveys/pages/OpinionSurveyReportPage', function(OpinionSurveyReportPage)
    {
      return new OpinionSurveyReportPage({
        query: req.query
      });
    });
  });

  router.map('/opinionSurveys', canManage, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      ListView: OpinionSurveyListView,
      collection: new OpinionSurveyCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/opinionSurveys/:id', canManage, function(req)
  {
    viewport.showPage(new OpinionSurveyDetailsPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys;add', canManage, function()
  {
    viewport.showPage(new OpinionSurveyAddFormPage({
      model: new OpinionSurvey()
    }));
  });

  router.map('/opinionSurveys/:id;edit', canManage, function(req)
  {
    viewport.showPage(new OpinionSurveyEditFormPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys/:id;editEmployeeCount', canManage, function(req)
  {
    viewport.showPage(new EmployeeCountEditFormPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys/:id;delete', canManage, _.partial(showDeleteFormPage, OpinionSurvey, _, _, {
    baseBreadcrumb: true
  }));

  router.map('/opinionSurveys;settings', canManage, function(req)
  {
    viewport.loadPage('app/opinionSurveys/pages/OpinionSurveySettingsPage', function(OpinionSurveySettingsPage)
    {
      return new OpinionSurveySettingsPage({
        initialTab: req.query.tab
      });
    });
  });

});
