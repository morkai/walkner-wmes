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

  var nls = 'i18n!app/nls/wmes-compRel-funcs';
  var model = 'app/wmes-compRel-funcs/Func';
  var canView = user.auth('COMP_REL:MANAGE');
  var canManage = canView;
  var baseBreadcrumb = '#compRel/entries';

  router.map('/compRel/funcs', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-compRel-funcs/FuncCollection',
        nls
      ],
      function(ListPage, FuncCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new FuncCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name', className: 'is-min'},
            {id: 'mor', className: 'is-min'},
            {id: 'users'}
          ]
        });
      }
    );
  });

  router.map('/compRel/funcs/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-compRel-funcs/templates/details',
        nls
      ],
      function(DetailsPage, Func, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Func({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/compRel/funcs;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-funcs/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, Func, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Func()
        }));
      }
    );
  });

  router.map('/compRel/funcs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-funcs/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, Func, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Func({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/compRel/funcs/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
