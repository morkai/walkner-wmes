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
  './OpinionSurveyReport',
  './pages/OpinionSurveyDetailsPage',
  './pages/OpinionSurveyAddFormPage',
  './pages/OpinionSurveyEditFormPage',
  './pages/EmployeeCountEditFormPage',
  './pages/OpinionSurveyReportPage',
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
  OpinionSurveyReport,
  OpinionSurveyDetailsPage,
  OpinionSurveyAddFormPage,
  OpinionSurveyEditFormPage,
  EmployeeCountEditFormPage,
  OpinionSurveyReportPage,
  OpinionSurveyListView
) {
  'use strict';

  var canAccess = user.auth();

  router.map('/opinionSurveyReport', canAccess, function(req)
  {
    viewport.showPage(new OpinionSurveyReportPage({
      model: new OpinionSurveyReport({
        from: +req.query.from || undefined,
        to: +req.query.to || undefined,
        interval: req.query.interval
      })
    }));
  });

  router.map('/opinionSurveys', canAccess, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      ListView: OpinionSurveyListView,
      collection: new OpinionSurveyCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/opinionSurveys/:id', canAccess, function(req)
  {
    viewport.showPage(new OpinionSurveyDetailsPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys;add', canAccess, function()
  {
    viewport.showPage(new OpinionSurveyAddFormPage({
      model: new OpinionSurvey()
    }));
  });

  router.map('/opinionSurveys/:id;edit', canAccess, function(req)
  {
    viewport.showPage(new OpinionSurveyEditFormPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys/:id;editEmployeeCount', canAccess, function(req)
  {
    viewport.showPage(new EmployeeCountEditFormPage({
      model: new OpinionSurvey({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveys/:id;delete', canAccess, _.partial(showDeleteFormPage, OpinionSurvey, _, _, {
    baseBreadcrumb: true
  }));

});
