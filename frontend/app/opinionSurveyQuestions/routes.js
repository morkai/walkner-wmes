// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyQuestion',
  'i18n!app/nls/opinionSurveyQuestions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyQuestion
) {
  'use strict';

  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyQuestions', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/opinionSurveyQuestions/OpinionSurveyQuestionCollection'
      ],
      function(ListPage, OpinionSurveyQuestionCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new OpinionSurveyQuestionCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'short', className: 'is-min'},
            'full'
          ]
        });
      }
    );
  });

  router.map('/opinionSurveyQuestions/:id', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/opinionSurveyQuestions/OpinionSurveyQuestion',
        'app/opinionSurveyQuestions/templates/details'
      ],
      function(DetailsPage, OpinionSurveyQuestion, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new OpinionSurveyQuestion({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/opinionSurveyQuestions;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/opinionSurveyQuestions/OpinionSurveyQuestion',
        'app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView'
      ],
      function(AddFormPage, OpinionSurveyQuestion, OpinionSurveyQuestionFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyQuestionFormView,
          model: new OpinionSurveyQuestion()
        });
      }
    );
  });

  router.map('/opinionSurveyQuestions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/opinionSurveyQuestions/OpinionSurveyQuestion',
        'app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView'
      ],
      function(EditFormPage, OpinionSurveyQuestion, OpinionSurveyQuestionFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyQuestionFormView,
          model: new OpinionSurveyQuestion({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveyQuestions/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyQuestion, _, _, {
      baseBreadcrumb: true
    })
  );

});
