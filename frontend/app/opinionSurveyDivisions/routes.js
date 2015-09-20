// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyDivisionCollection',
  './OpinionSurveyDivision',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  './views/OpinionSurveyDivisionFormView',
  'app/opinionSurveyDivisions/templates/details',
  'i18n!app/nls/opinionSurveyDivisions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyDivisionCollection,
  OpinionSurveyDivision,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  OpinionSurveyDivisionFormView,
  detailsTemplate
) {
  'use strict';

  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyDivisions', canManage, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new OpinionSurveyDivisionCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        {id: 'short', className: 'is-min'},
        'full'
      ]
    }));
  });

  router.map('/opinionSurveyDivisions/:id', canManage, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new OpinionSurveyDivision({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/opinionSurveyDivisions;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyDivisionFormView,
      model: new OpinionSurveyDivision()
    }));
  });

  router.map('/opinionSurveyDivisions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyDivisionFormView,
      model: new OpinionSurveyDivision({_id: req.params.id})
    }));
  });

  router.map(
    '/opinionSurveyDivisions/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyDivision, _, _, {
      baseBreadcrumb: true
    })
  );

});
