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

  var css = 'css!app/wmes-snf-programs/assets/main';
  var nls = 'i18n!app/nls/wmes-snf-programs';
  var canView = user.auth('SNF:VIEW');
  var canManage = user.auth('SNF:MANAGE');

  router.map('/snf/programs', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-snf-programs/views/FilterView',
        'app/wmes-snf-programs/views/ListView',
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
        'app/wmes-snf-programs/pages/DetailsPage',
        css,
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
        'app/wmes-snf-programs/views/FormView',
        css,
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
        'app/wmes-snf-programs/views/FormView',
        css,
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
