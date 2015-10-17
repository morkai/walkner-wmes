// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyEmployerCollection',
  './OpinionSurveyEmployer',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  './views/OpinionSurveyEmployerFormView',
  'app/opinionSurveyEmployers/templates/details',
  'i18n!app/nls/opinionSurveyEmployers'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyEmployerCollection,
  OpinionSurveyEmployer,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  OpinionSurveyEmployerFormView,
  detailsTemplate
) {
  'use strict';

  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyEmployers', canManage, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new OpinionSurveyEmployerCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        {id: 'short', className: 'is-min'},
        'full',
        {id: 'color', className: 'is-min'}
      ]
    }));
  });

  router.map('/opinionSurveyEmployers/:id', canManage, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new OpinionSurveyEmployer({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/opinionSurveyEmployers;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyEmployerFormView,
      model: new OpinionSurveyEmployer()
    }));
  });

  router.map('/opinionSurveyEmployers/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyEmployerFormView,
      model: new OpinionSurveyEmployer({_id: req.params.id})
    }));
  });

  router.map(
    '/opinionSurveyEmployers/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyEmployer, _, _, {
      baseBreadcrumb: true
    })
  );

});
