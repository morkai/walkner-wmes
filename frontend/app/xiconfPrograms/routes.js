// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './XiconfProgram',
  './XiconfProgramCollection',
  'i18n!app/nls/xiconfPrograms'
], function(
  _,
  t,
  router,
  viewport,
  user,
  showDeleteFormPage,
  XiconfProgram,
  XiconfProgramCollection
) {
  'use strict';

  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/xiconf/programs', canView, function(req)
  {
    viewport.loadPage(['app/xiconfPrograms/pages/XiconfProgramListPage'], function(XiconfProgramListPage)
    {
      return new XiconfProgramListPage({
        collection: new XiconfProgramCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });

  router.map('/xiconf/programs/:id', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/xiconfPrograms/views/XiconfProgramDetailsView'],
      function(DetailsPage, XiconfProgramDetailsView)
      {
        return new DetailsPage({
          DetailsView: XiconfProgramDetailsView,
          model: new XiconfProgram({_id: req.params.id}),
          breadcrumbs: createBreadcrumbsProvider(DetailsPage)
        });
      }
    );
  });

  router.map('/xiconf/programs;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/xiconfPrograms/views/XiconfProgramFormView'],
      function(AddFormPage, XiconfProgramFormView)
      {
        return new AddFormPage({
          FormView: XiconfProgramFormView,
          model: new XiconfProgram(),
          breadcrumbs: createBreadcrumbsProvider(AddFormPage)
        });
      }
    );
  });

  router.map('/xiconf/programs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/xiconfPrograms/views/XiconfProgramFormView'],
      function(EditFormPage, XiconfProgramFormView)
      {
        return new EditFormPage({
          FormView: XiconfProgramFormView,
          model: new XiconfProgram({_id: req.params.id}),
          breadcrumbs: createBreadcrumbsProvider(EditFormPage)
        });
      }
    );
  });

  router.map(
    '/xiconf/programs/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, XiconfProgram, _, _, {
      breadcrumbs: createBreadcrumbsProvider()
    })
  );

  function createBreadcrumbsProvider(Page)
  {
    return function()
    {
      var breadcrumbs = this.constructor.prototype.breadcrumbs.call(this);

      breadcrumbs.unshift(t.bound('xiconfPrograms', 'BREADCRUMBS:base'));

      return breadcrumbs;
    };
  }
});
