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

  var nls = 'i18n!app/nls/wmes-compRel-reasons';
  var model = 'app/wmes-compRel-reasons/Reason';
  var canView = user.auth('COMP_REL:MANAGE');
  var canManage = canView;
  var baseBreadcrumb = '#compRel/entries';

  router.map('/compRel/reasons', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-compRel-reasons/ReasonCollection',
        nls
      ],
      function(ListPage, ReasonCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new ReasonCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name'},
            {id: 'active', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/compRel/reasons/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-compRel-reasons/templates/details',
        nls
      ],
      function(DetailsPage, Reason, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Reason({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/compRel/reasons;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-reasons/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, Reason, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Reason()
        }));
      }
    );
  });

  router.map('/compRel/reasons/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-compRel-entries/dictionaries',
        model,
        'app/wmes-compRel-reasons/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, Reason, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Reason({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/compRel/reasons/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
