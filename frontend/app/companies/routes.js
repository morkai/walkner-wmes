define([
  '../router',
  '../viewport',
  '../user',
  '../data/companies',
  './Company',
  'i18n!app/nls/companies'
], function(
  router,
  viewport,
  user,
  companies,
  Company
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/companies', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: companies,
        columns: ['_id', 'name', 'fteMasterPosition', 'fteLeaderPosition']
      });
    });
  });

  router.map('/companies/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/companies/templates/details'],
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
      ['app/core/pages/AddFormPage', 'app/companies/views/CompanyFormView'],
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
      ['app/core/pages/EditFormPage', 'app/companies/views/CompanyFormView'],
      function(EditFormPage, CompanyFormView)
      {
        return new EditFormPage({
          FormView: CompanyFormView,
          model: new Company({_id: req.params.id})
        });
      }
    );
  });

  router.map('/companies/:id;delete', canManage, function(req, referer)
  {
    var model = new Company({_id: req.params.id});

    viewport.loadPage(['app/core/pages/ActionFormPage'], function(ActionFormPage)
    {
      return new ActionFormPage({
        model: model,
        actionKey: 'delete',
        successUrl: model.genClientUrl('base'),
        cancelUrl: referer || model.genClientUrl('base'),
        formMethod: 'DELETE',
        formAction: model.url(),
        formActionSeverity: 'danger'
      });
    });
  });

});
