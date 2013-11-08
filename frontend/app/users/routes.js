define([
  'app/router',
  'app/viewport',
  'app/user',
  './pages/UserListPage',
  './pages/UserDetailsPage',
  './pages/AddUserFormPage',
  './pages/EditUserFormPage',
  './pages/UserActionFormPage',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  user,
  UserListPage,
  UserDetailsPage,
  AddUserFormPage,
  EditUserFormPage,
  UserActionFormPage
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/users', canView, function showUserListPage(req)
  {
    viewport.showPage(new UserListPage({rql: req.rql}));
  });

  router.map(
    '/users/:id',
    function(req, referer, next)
    {
      if (req.params.id === user.data._id)
      {
        next();
      }
      else
      {
        canView(req, referer, next);
      }
    },
    function showUserDetailsPage(req)
    {
      viewport.showPage(new UserDetailsPage({userId: req.params.id}));
    }
  );

  router.map('/users;add', canManage, function showAddUserFormPage()
  {
    viewport.showPage(new AddUserFormPage());
  });

  router.map('/users/:id;edit', canManage, function showEditUserFormPage(req)
  {
    viewport.showPage(new EditUserFormPage({userId: req.params.id}));
  });

  router.map('/users/:id;delete', canManage, function showDeleteUserFormPage(req, referer)
  {
    viewport.showPage(new UserActionFormPage({
      userId: req.params.id,
      actionKey: 'delete',
      successUrl: '#users',
      cancelUrl: '#' + (referer || '/users').substr(1),
      formMethod: 'DELETE',
      formAction: '/users/' + req.params.id,
      formActionSeverity: 'danger'
    }));
  });
});
