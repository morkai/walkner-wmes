// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/xiconfPrograms/assets/main';
  var nls = 'i18n!app/nls/xiconfPrograms';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/xiconf/programs', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfPrograms/XiconfProgramCollection',
        'app/xiconfPrograms/pages/XiconfProgramListPage',
        css,
        nls
      ],
      function(XiconfProgramCollection, XiconfProgramListPage)
      {
        return new XiconfProgramListPage({
          collection: new XiconfProgramCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/xiconf/programs/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/xiconfPrograms/XiconfProgram',
        'app/xiconfPrograms/views/XiconfProgramDetailsView',
        css,
        nls
      ],
      function(DetailsPage, XiconfProgram, XiconfProgramDetailsView)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
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
      [
        'app/core/pages/AddFormPage',
        'app/xiconfPrograms/XiconfProgram',
        'app/xiconfPrograms/views/XiconfProgramFormView',
        css,
        nls
      ],
      function(AddFormPage, XiconfProgram, XiconfProgramFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
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
      [
        'app/core/pages/EditFormPage',
        'app/xiconfPrograms/XiconfProgram',
        'app/xiconfPrograms/views/XiconfProgramFormView',
        css,
        nls
      ],
      function(EditFormPage, XiconfProgram, XiconfProgramFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
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
    _.partial(showDeleteFormPage, 'app/xiconfPrograms/XiconfProgram', _, _, {
      baseBreadcrumb: true
    })
  );
});
