// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyDivision'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyDivision
) {
  'use strict';

  var nls = 'i18n!app/nls/opinionSurveyDivisions';
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyDivisions', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/opinionSurveyDivisions/OpinionSurveyDivisionCollection',
        nls
      ],
      function(ListPage, OpinionSurveyDivisionCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new OpinionSurveyDivisionCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'short', className: 'is-min'},
            'full'
          ]
        });
      }
    );
  });

  router.map('/opinionSurveyDivisions/:id', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/opinionSurveyDivisions/OpinionSurveyDivision',
        'app/opinionSurveyDivisions/templates/details',
        nls
      ],
      function(DetailsPage, OpinionSurveyDivision, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new OpinionSurveyDivision({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/opinionSurveyDivisions;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/opinionSurveyDivisions/OpinionSurveyDivision',
        'app/opinionSurveyDivisions/views/OpinionSurveyDivisionFormView',
        nls
      ],
      function(AddFormPage, OpinionSurveyDivision, OpinionSurveyDivisionFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyDivisionFormView,
          model: new OpinionSurveyDivision()
        });
      }
    );
  });

  router.map('/opinionSurveyDivisions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/opinionSurveyDivisions/OpinionSurveyDivision',
        'app/opinionSurveyDivisions/views/OpinionSurveyDivisionFormView',
        nls
      ],
      function(EditFormPage, OpinionSurveyDivision, OpinionSurveyDivisionFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyDivisionFormView,
          model: new OpinionSurveyDivision({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveyDivisions/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyDivision, _, _, {
      baseBreadcrumb: true
    })
  );

});
