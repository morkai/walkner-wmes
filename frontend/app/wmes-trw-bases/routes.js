// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/wmes-trw-bases/assets/main';
  var nls = 'i18n!app/nls/wmes-trw-bases';
  var model = 'app/wmes-trw-bases/Base';
  var canView = user.auth('TRW:VIEW');
  var canManage = user.auth('TRW:MANAGE');
  var baseBreadcrumb = true;

  router.map('/trw/bases', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-trw-tests/dictionaries',
        'app/wmes-trw-bases/BaseCollection',
        'app/wmes-trw-bases/views/FilterView',
        nls
      ],
      function(FilteredListPage, dictionaries, BaseCollection, FilterView)
      {
        return dictionaries.bind(new FilteredListPage({
          baseBreadcrumb: baseBreadcrumb,
          FilterView: FilterView,
          collection: new BaseCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'tester', className: 'is-min'},
            'name'
          ]
        }));
      }
    );
  });

  router.map('/trw/bases/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-trw-bases/pages/DetailsPage',
        model,
        css,
        nls
      ],
      function(DetailsPage, Base)
      {
        return new DetailsPage({
          model: new Base({_id: req.params.id})
        });
      }
    );
  });

  router.map('/trw/bases;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-trw-tests/dictionaries',
        model,
        'app/wmes-trw-bases/views/FormView',
        css,
        nls
      ],
      function(AddFormPage, dictionaries, Base, FormView)
      {
        var model = new Base({_id: req.query.copy});

        model.once('sync', function()
        {
          if (req.query.copy)
          {
            model.set({
              _id: undefined,
              name: t('core', 'labelCopySuffix', {
                label: model.get('name')
              })
            });

            broker.publish('router.navigate', {
              url: '/trw/bases;add',
              trigger: false,
              replace: true
            });
          }
        });

        return dictionaries.bind(new AddFormPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: model
        }));
      }
    );
  });

  router.map('/trw/bases/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-trw-tests/dictionaries',
        model,
        'app/wmes-trw-bases/views/FormView',
        css,
        nls
      ],
      function(EditFormPage, dictionaries, Base, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Base({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/trw/bases/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
