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

  var nls = 'i18n!app/nls/wmes-toolcal-tools';
  var model = 'app/wmes-toolcal-tools/Tool';
  var canView = user.auth('TOOLCAL:VIEW');
  var canManage = user.auth('TOOLCAL:MANAGE');

  router.map('/toolcal/tools', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-toolcal-tools/ToolCollection',
        'app/wmes-toolcal-tools/pages/ListPage',
        nls
      ],
      function(ToolCollection, ListPage)
      {
        return new ListPage({
          collection: new ToolCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/toolcal/tools/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        model,
        'app/wmes-toolcal-tools/pages/DetailsPage',
        'css!app/wmes-toolcal-tools/assets/main',
        nls
      ],
      function(Tool, DetailsPage)
      {
        return new DetailsPage({
          model: new Tool({_id: req.params.id})
        });
      }
    );
  });

  router.map('/toolcal/tools;add', canManage, function()
  {
    viewport.loadPage(
      [
        model,
        'app/wmes-toolcal-tools/pages/AddFormPage',
        nls
      ],
      function(Tool, AddFormPage)
      {
        return new AddFormPage({
          model: new Tool()
        });
      }
    );
  });

  router.map('/toolcal/tools/:id;edit', canView, function(req)
  {
    viewport.loadPage(
      [
        model,
        'app/wmes-toolcal-tools/pages/EditFormPage',
        nls
      ],
      function(Tool, EditFormPage)
      {
        return new EditFormPage({
          model: new Tool({_id: req.params.id})
        });
      }
    );
  });

  router.map('/toolcal/tools/:id;delete', canView, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));

  router.map('/toolcal/settings', canManage, function(req)
  {
    viewport.loadPage(['app/wmes-toolcal-tools/pages/SettingsPage', nls], function(SettingsPage)
    {
      return new SettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
