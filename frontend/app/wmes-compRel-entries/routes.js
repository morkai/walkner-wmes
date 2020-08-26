// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Entry',
  'i18n!app/nls/wmes-compRel-entries'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage,
  Entry
) {
  'use strict';

  var model = 'app/wmes-compRel-entries/Entry';
  var css = ['css!app/wmes-compRel-entries/assets/main'];
  var nls = ['i18n!app/nls/wmes-compRel-entries'];
  var canView = user.auth(Entry.can.view.bind(Entry));
  var canAdd = user.auth(Entry.can.add.bind(Entry));
  var canManage = user.auth(Entry.can.manage.bind(Entry));

  router.map('/compRel/entries', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-compRel-entries/dictionaries',
        'app/wmes-compRel-entries/EntryCollection',
        'app/wmes-compRel-entries/pages/ListPage',
        css, nls
      ],
      function(dictionaries, EntryCollection, ListPage)
      {
        req.rql.selector.args.forEach(function(term)
        {
          if (term.name === 'eq' && term.args[0] === 'observers.user.id' && term.args[1] === 'mine')
          {
            term.args[1] = user.data._id;
          }
        });

        return dictionaries.bind(new ListPage({
          collection: new EntryCollection(null, {rqlQuery: req.rql})
        }));
      }
    );
  });

  router.map('/compRel/entries/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-entries/pages/DetailsPage',
        css, nls
      ],
      function(dictionaries, Entry, DetailsPage)
      {
        return dictionaries.bind(new DetailsPage({
          model: new Entry({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/compRel/entries;add', canAdd, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-entries/views/FormView',
        nls, css
      ],
      function(AddFormPage, dictionaries, Entry, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Entry()
        }));
      }
    );
  });

  router.map('/compRel/entries/:id;edit', canAdd, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-entries/views/FormView',
        nls, css
      ],
      function(EditFormPage, dictionaries, Entry, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Entry({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/compRel/entries/:id;history', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-entries/pages/HistoryPage',
        css, nls
      ],
      function(dictionaries, Entry, HistoryPage)
      {
        return dictionaries.bind(new HistoryPage({
          model: new Entry({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/compRel/entries/:id;delete', canView, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: false
  }));

  router.map('/compRel/settings', canManage, function(req)
  {
    viewport.loadPage(
      ['app/wmes-compRel-entries/pages/SettingsPage', css, nls],
      function(SettingsPage)
      {
        return new SettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
