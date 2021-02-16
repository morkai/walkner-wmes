// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/pages/ListPage',
  'app/core/pages/DetailsPage',
  'app/core/pages/AddFormPage',
  'app/core/pages/EditFormPage',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  './Employment',
  './EmploymentCollection',
  'i18n!app/nls/wmes-osh-employments'
], function(
  _,
  router,
  viewport,
  user,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  showDeleteFormPage,
  dictionaries,
  Employment,
  EmploymentCollection
) {
  'use strict';

  const canView = user.auth('OSH:HR:VIEW');
  const canManage = user.auth('OSH:HR:MANAGE');

  router.map('/osh/employments', canView, (req) =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new EmploymentCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'month', className: 'is-min'},
        {id: 'internal', className: 'is-min is-number'},
        {id: 'external', className: 'is-min is-number'},
        {id: 'absent', className: 'is-min is-number'},
        {id: 'total', className: 'is-min is-number'},
        {id: 'observers', className: 'is-min is-number'},
        '-'
      ]
    })));
  });

  router.map('/osh/employments/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-employments/templates/details'
      ],
      (detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new Employment({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/employments;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-employments/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Employment()
        }));
      }
    );
  });

  router.map('/osh/employments/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-employments/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new Employment({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/employments/:id;delete', canManage, _.partial(showDeleteFormPage, Employment, _, _, {

  }));
});
