// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/companies',
  './Company'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  companies,
  Company
) {
  'use strict';

  var nls = 'i18n!app/nls/companies';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/companies', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: companies,
        columns: [
          {id: '_id', className: 'is-min'},
          {id: 'name', className: 'is-min'},
          'color'
        ]
      });
    });
  });

  router.map('/companies/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/companies/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Company({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/companies;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/companies/views/CompanyFormView', nls],
      function(AddFormPage, CompanyFormView)
      {
        return new AddFormPage({
          FormView: CompanyFormView,
          model: new Company()
        });
      }
    );
  });

  router.map('/companies/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/companies/views/CompanyFormView', nls],
      function(EditFormPage, CompanyFormView)
      {
        return new EditFormPage({
          FormView: CompanyFormView,
          model: new Company({_id: req.params.id})
        });
      }
    );
  });

  router.map('/companies/:id;delete', canManage, showDeleteFormPage.bind(null, Company));

});
