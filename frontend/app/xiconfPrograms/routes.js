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
  './XiconfProgramCollection'
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

  var nls = 'i18n!app/nls/xiconfPrograms';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/xiconf/programs', canView, function(req)
  {
    viewport.loadPage(['app/xiconfPrograms/pages/XiconfProgramListPage', nls], function(XiconfProgramListPage)
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
      ['app/core/pages/DetailsPage', 'app/xiconfPrograms/views/XiconfProgramDetailsView', nls],
      function(DetailsPage, XiconfProgramDetailsView)
      {
        return new DetailsPage({
          DetailsView: XiconfProgramDetailsView,
          model: new XiconfProgram({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/xiconf/programs;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/xiconfPrograms/views/XiconfProgramFormView', nls],
      function(AddFormPage, XiconfProgramFormView)
      {
        return new AddFormPage({
          FormView: XiconfProgramFormView,
          model: new XiconfProgram(),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/xiconf/programs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/xiconfPrograms/views/XiconfProgramFormView', nls],
      function(EditFormPage, XiconfProgramFormView)
      {
        return new EditFormPage({
          FormView: XiconfProgramFormView,
          model: new XiconfProgram({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map(
    '/xiconf/programs/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, XiconfProgram, _, _, {
      baseBreadcrumb: true
    })
  );

});
