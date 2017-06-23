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

  var nls = 'i18n!app/nls/d8Entries';
  var model = 'app/d8Entries/D8Entry';
  var canView = user.auth('D8:VIEW');
  var canManage = user.auth('D8:MANAGE');

  router.map('/d8/entries', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/d8Entries/D8EntryCollection',
        'app/d8Entries/pages/D8EntryListPage',
        nls
      ],
      function(D8EntryCollection, D8EntryListPage)
      {
        return new D8EntryListPage({
          collection: new D8EntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/d8/entries/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        model,
        'app/d8Entries/pages/D8EntryDetailsPage',
        nls
      ],
      function(D8Entry, D8EntryDetailsPage)
      {
        return new D8EntryDetailsPage({
          model: new D8Entry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/d8/entries;add', canManage, function()
  {
    viewport.loadPage(
      [
        model,
        'app/d8Entries/pages/D8EntryAddFormPage',
        nls
      ],
      function(D8Entry, D8EntryAddFormPage)
      {
        return new D8EntryAddFormPage({
          model: new D8Entry()
        });
      }
    );
  });

  router.map('/d8/entries/:id;edit', canView, function(req)
  {
    viewport.loadPage(
      [
        model,
        'app/d8Entries/pages/D8EntryEditFormPage',
        nls
      ],
      function(D8Entry, D8EntryEditFormPage)
      {
        return new D8EntryEditFormPage({
          model: new D8Entry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/d8/entries/:id;delete', canView, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));
});
