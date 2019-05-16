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

  var nls = 'i18n!app/nls/wmes-trw-programs';
  var model = 'app/wmes-trw-programs/Program';
  var canView = user.auth('TRW:VIEW');
  var canManage = user.auth('TRW:PROGRAM', 'TRW:MANAGE');
  var baseBreadcrumb = true;

  router.map('/trw/programs', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-trw-tests/dictionaries',
        'app/wmes-trw-programs/ProgramCollection',
        'app/wmes-trw-programs/views/FilterView',
        nls
      ],
      function(FilteredListPage, dictionaries, ProgramCollection, FilterView)
      {
        return dictionaries.bind(new FilteredListPage({
          baseBreadcrumb: baseBreadcrumb,
          FilterView: FilterView,
          collection: new ProgramCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'base', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            '-'
          ]
        }));
      }
    );
  });

  router.map('/trw/programs/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-trw-programs/templates/details',
        nls
      ],
      function(DetailsPage, Program, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          model: new Program({_id: req.params.id}),
          detailsTemplate: detailsTemplate,
          actions: function()
          {
            return [{
              icon: 'copy',
              label: this.t('PAGE_ACTION:copy'),
              href: '#trw/programs;add?copy=' + this.model.id
            }].concat(DetailsPage.prototype.actions.apply(this, arguments));
          }
        });
      }
    );
  });

  router.map('/trw/programs;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-trw-tests/dictionaries',
        model,
        'app/wmes-trw-programs/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, Program, FormView)
      {
        var model = new Program({_id: req.query.copy});

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
              url: '/trw/programs;add',
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

  router.map('/trw/programs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-trw-tests/dictionaries',
        model,
        'app/wmes-trw-programs/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, Program, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Program({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/trw/programs/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
