// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './views/NavbarView',
  'i18n!app/nls/wmes-fap-entries'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage,
  NavbarView
) {
  'use strict';

  var model = 'app/wmes-fap-entries/Entry';
  var canView = user.auth('LOCAL', 'USER');
  var canManage = user.auth('FAP:MANAGE');

  NavbarView.setUp();

  router.map('/fap/entries', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-fap-entries/EntryCollection',
        'app/wmes-fap-entries/pages/ListPage'
      ],
      function(EntryCollection, ListPage)
      {
        return new ListPage({
          collection: new EntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/fap/entries/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        model,
        'app/wmes-fap-entries/pages/DetailsPage'
      ],
      function(Entry, DetailsPage)
      {
        return new DetailsPage({
          model: new Entry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fap/entries/:id;delete', canView, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));

  router.map('/fap/settings', canManage, function(req)
  {
    viewport.loadPage(['app/wmes-fap-entries/pages/SettingsPage'], function(SettingsPage)
    {
      return new SettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
