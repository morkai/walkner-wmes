// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/mrpControllers',
  './MrpController',
  'i18n!app/nls/mrpControllers'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  mrpControllers,
  MrpController
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/mrpControllers', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/mrpControllers/views/MrpControllerListView'],
      function(ListPage, MrpControllerListView)
      {
        return new ListPage({
          ListView: MrpControllerListView,
          collection: mrpControllers
        });
      }
    );
  });

  router.map('/mrpControllers/:id', function(req)
  {
    viewport.loadPage(
      ['app/mrpControllers/pages/MrpControllerDetailsPage'],
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
      ['app/core/pages/AddFormPage', 'app/mrpControllers/views/MrpControllerFormView'],
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
      ['app/core/pages/EditFormPage', 'app/mrpControllers/views/MrpControllerFormView'],
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
