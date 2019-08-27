// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/pfepEntries/assets/main';
  var nls = 'i18n!app/nls/pfepEntries';
  var canView = user.auth();
  var canManage = user.auth('PFEP:MANAGE');

  router.map('/pfep/entries', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/pfepEntries/PfepEntryCollection',
        'app/pfepEntries/pages/PfepEntryListPage',
        css,
        nls
      ],
      function(PfepEntryCollection, PfepEntryListPage)
      {
        return new PfepEntryListPage({
          collection: new PfepEntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/pfep/entries/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/pfepEntries/PfepEntry',
        'app/pfepEntries/pages/PfepEntryDetailsPage',
        css,
        nls
      ],
      function(PfepEntry, PfepEntryDetailsPage)
      {
        return new PfepEntryDetailsPage({
          model: new PfepEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/pfep/entries;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/pfepEntries/PfepEntry',
        'app/pfepEntries/pages/PfepEntryAddFormPage',
        nls
      ],
      function(PfepEntry, PfepEntryAddFormPage)
      {
        return new PfepEntryAddFormPage({
          model: new PfepEntry()
        });
      }
    );
  });

  router.map('/pfep/entries/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/pfepEntries/PfepEntry',
        'app/pfepEntries/pages/PfepEntryEditFormPage',
        nls
      ],
      function(PfepEntry, PfepEntryEditFormPage)
      {
        return new PfepEntryEditFormPage({
          model: new PfepEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/pfep/entries/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/pfepEntries/PfepEntry', _, _, {
    baseBreadcrumb: true
  }));
});
