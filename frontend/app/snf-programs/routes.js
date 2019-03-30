// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Program',
  './ProgramCollection'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  Program,
  ProgramCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/snf-programs';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/snf/programs', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/snf-programs/views/FilterView',
        'app/snf-programs/views/ListView',
        nls
      ],
      function(FilteredListPage, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: true,
          FilterView: FilterView,
          ListView: ListView,
          collection: new ProgramCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/snf/programs/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/snf-programs/pages/DetailsPage',
        nls
      ],
      function(DetailsPage)
      {
        return new DetailsPage({
          model: new Program({_id: req.params.id})
        });
      }
    );
  });

  router.map('/snf/programs;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/snf-programs/views/FormView',
        nls
      ],
      function(AddFormPage, FormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Program()
        });
      }
    );
  });

  router.map('/snf/programs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/snf-programs/views/FormView',
        nls
      ],
      function(EditFormPage, FormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Program({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/snf/programs/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, Program, _, _, {
      baseBreadcrumb: true
    })
  );
});
