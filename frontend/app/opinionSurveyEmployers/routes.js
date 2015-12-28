// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyEmployer'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyEmployer
) {
  'use strict';

  var nls = 'i18n!app/nls/opinionSurveyEmployers';
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyEmployers', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/opinionSurveyEmployers/OpinionSurveyEmployerCollection',
        nls
      ],
      function(ListPage, OpinionSurveyEmployerCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new OpinionSurveyEmployerCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'short', className: 'is-min'},
            'full',
            {id: 'color', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/opinionSurveyEmployers/:id', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/opinionSurveyEmployers/OpinionSurveyEmployer',
        'app/opinionSurveyEmployers/templates/details',
        nls
      ],
      function(DetailsPage, OpinionSurveyEmployer, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new OpinionSurveyEmployer({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/opinionSurveyEmployers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/opinionSurveyEmployers/OpinionSurveyEmployer',
        'app/opinionSurveyEmployers/views/OpinionSurveyEmployerFormView',
        nls
      ],
      function(AddFormPage, OpinionSurveyEmployer, OpinionSurveyEmployerFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyEmployerFormView,
          model: new OpinionSurveyEmployer()
        });
      }
    );
  });

  router.map('/opinionSurveyEmployers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/opinionSurveyEmployers/OpinionSurveyEmployer',
        'app/opinionSurveyEmployers/views/OpinionSurveyEmployerFormView',
        nls
      ],
      function(EditFormPage, OpinionSurveyEmployer, OpinionSurveyEmployerFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: OpinionSurveyEmployerFormView,
          model: new OpinionSurveyEmployer({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveyEmployers/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyEmployer, _, _, {
      baseBreadcrumb: true
    })
  );

});
