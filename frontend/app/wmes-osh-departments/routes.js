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
  './Department',
  './DepartmentCollection',
  'i18n!app/nls/wmes-osh-departments'
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
  Department
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/departments', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.departments,
      columns: [
        {id: 'workplace', className: 'is-min'},
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'manager', className: 'is-min'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/departments/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-departments/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.departments.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new Department({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/departments;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-departments/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Department()
        }));
      }
    );
  });

  router.map('/osh/departments/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-departments/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.departments.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Department({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/departments/:id;delete', canManage, _.partial(showDeleteFormPage, Department, _, _, {

  }));
});
