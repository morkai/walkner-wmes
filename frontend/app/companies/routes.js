define([
  '../router',
  '../viewport',
  '../user',
  '../data/companies',
  './Company',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/CompanyFormView',
  'app/companies/templates/details',
  'i18n!app/nls/companies'
], function(
  router,
  viewport,
  user,
  companies,
  Company,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  CompanyFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/companies', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: companies,
      columns: ['_id', 'name']
    }));
  });

  router.map('/companies/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new Company({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/companies;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: CompanyFormView,
      model: new Company()
    }));
  });

  router.map('/companies/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: CompanyFormView,
      model: new Company({_id: req.params.id})
    }));
  });

  router.map('/companies/:id;delete', canManage, function(req, referer)
  {
    var model = new Company({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});
