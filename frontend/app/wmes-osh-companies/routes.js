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
  './Company',
  './CompanyCollection',
  'i18n!app/nls/wmes-osh-companies'
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
  Company
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/companies', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.companies,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'employer', className: 'is-min'},
        {id: 'external', className: 'is-min'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/companies/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-companies/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.companies.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: model || new Company({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/companies;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-companies/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Company()
        }));
      }
    );
  });

  router.map('/osh/companies/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-companies/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.companies.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Company({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/companies/:id;delete', canManage, _.partial(showDeleteFormPage, Company, _, _, {

  }));
});
