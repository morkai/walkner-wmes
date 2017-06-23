// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/mrpControllers',
  './MrpController'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  mrpControllers,
  MrpController
) {
  'use strict';

  var nls = 'i18n!app/nls/mrpControllers';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/mrpControllers', canView, function()
  {
    viewport.loadPage(
      ['app/mrpControllers/pages/MrpControllerListPage', nls],
      function(MrpControllerListPage)
      {
        return new MrpControllerListPage({
          collection: mrpControllers
        });
      }
    );
  });

  router.map('/mrpControllers/:id', function(req)
  {
    viewport.loadPage(
      ['app/mrpControllers/pages/MrpControllerDetailsPage', nls],
      function(MrpControllerDetailsPage)
      {
        return new MrpControllerDetailsPage({
          model: new MrpController({_id: req.params.id})
        });
      }
    );
  });

  router.map('/mrpControllers;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/mrpControllers/views/MrpControllerFormView', nls],
      function(AddFormPage, MrpControllerFormView)
      {
        return new AddFormPage({
          FormView: MrpControllerFormView,
          model: new MrpController()
        });
      }
    );
  });

  router.map('/mrpControllers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/mrpControllers/views/MrpControllerFormView', nls],
      function(EditFormPage, MrpControllerFormView)
      {
        return new EditFormPage({
          FormView: MrpControllerFormView,
          model: new MrpController({_id: req.params.id})
        });
      }
    );
  });

  router.map('/mrpControllers/:id;delete', canManage, showDeleteFormPage.bind(null, MrpController));
});
