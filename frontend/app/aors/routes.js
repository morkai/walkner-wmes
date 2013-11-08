define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/data/aors',
  './pages/AorListPage',
  './pages/AorDetailsPage',
  './pages/AddAorFormPage',
  './pages/EditAorFormPage',
  './pages/AorActionFormPage',
  'i18n!app/nls/aors'
], function(
  router,
  viewport,
  user,
  aors,
  AorListPage,
  AorDetailsPage,
  AddAorFormPage,
  EditAorFormPage,
  AorActionFormPage
) {
  'use strict';

  var canView = user.auth('AORS:VIEW');
  var canManage = user.auth('AORS:MANAGE');

  router.map('/aors', canView, function showAorListPage(req)
  {
    viewport.showPage(new AorListPage({rql: req.rql, aors: aors}));
  });

  router.map('/aors/:id', function showAorDetailsPage(req)
  {
    viewport.showPage(new AorDetailsPage({aorId: req.params.id}));
  });

  router.map('/aors;add', canManage, function showAddAorFormPage()
  {
    viewport.showPage(new AddAorFormPage());
  });

  router.map('/aors/:id;edit', canManage, function showEditAorFormPage(req)
  {
    viewport.showPage(new EditAorFormPage({aorId: req.params.id}));
  });

  router.map(
    '/aors/:id;delete', canManage, function showDeleteAorFormPage(req, referer)
    {
      viewport.showPage(new AorActionFormPage({
        aorId: req.params.id,
        actionKey: 'delete',
        successUrl: '#aors',
        cancelUrl: '#' + (referer || '/aors').substr(1),
        formMethod: 'DELETE',
        formAction: '/aors/' + req.params.id,
        formActionSeverity: 'danger'
      }));
    }
  );

});
