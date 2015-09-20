// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyQuestionCollection',
  './OpinionSurveyQuestion',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  './views/OpinionSurveyQuestionFormView',
  'app/opinionSurveyQuestions/templates/details',
  'i18n!app/nls/opinionSurveyQuestions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyQuestionCollection,
  OpinionSurveyQuestion,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  OpinionSurveyQuestionFormView,
  detailsTemplate
) {
  'use strict';

  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyQuestions', canManage, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new OpinionSurveyQuestionCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        {id: 'short', className: 'is-min'},
        'full'
      ]
    }));
  });

  router.map('/opinionSurveyQuestions/:id', canManage, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new OpinionSurveyQuestion({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/opinionSurveyQuestions;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyQuestionFormView,
      model: new OpinionSurveyQuestion()
    }));
  });

  router.map('/opinionSurveyQuestions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: OpinionSurveyQuestionFormView,
      model: new OpinionSurveyQuestion({_id: req.params.id})
    }));
  });

  router.map(
    '/opinionSurveyQuestions/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyQuestion, _, _, {
      baseBreadcrumb: true
    })
  );

});
