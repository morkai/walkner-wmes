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

  var nls = 'i18n!app/nls/opinionSurveyQuestions';
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyQuestions', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/opinionSurveyQuestions/OpinionSurveyQuestionCollection',
        nls
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
        'app/opinionSurveyQuestions/templates/details',
        nls
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
        'app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView',
        nls
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
        'app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView',
        nls
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
    _.partial(showDeleteFormPage, 'app/opinionSurveyQuestions/OpinionSurveyQuestion', _, _, {
      baseBreadcrumb: true
    })
  );

});
