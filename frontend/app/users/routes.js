define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './User',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  User
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/users', canView, function(req)
  {
    viewport.loadPage(['app/users/pages/UserListPage'], function(UserListPage)
    {
      return new UserListPage({rql: req.rql});
    });
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
    function(req)
    {
      viewport.loadPage(
        ['app/core/pages/DetailsPage', 'app/users/views/UserDetailsView'],
        function(DetailsPage, UserDetailsView)
        {
          return new DetailsPage({
            DetailsView: UserDetailsView,
            model: new User({_id: req.params.id})
          });
        }
      );
    }
  );

  router.map('/users;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/users/views/UserFormView'],
      function(AddFormPage, UserFormView)
      {
        return new AddFormPage({
          FormView: UserFormView,
          model: new User()
        });
      }
    );
  });

  router.map('/users/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/users/views/UserFormView'],
      function(EditFormPage, UserFormView)
      {
        return new EditFormPage({
          FormView: UserFormView,
          model: new User({_id: req.params.id})
        });
      }
    );
  });

  router.map('/users/:id;delete', canManage, showDeleteFormPage.bind(null, User));
});
