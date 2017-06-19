// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/View',
  '../core/util/showDeleteFormPage',
  './User',
  './pages/LogInFormPage',
  'i18n!app/nls/users'
], function(
  t,
  router,
  viewport,
  user,
  View,
  showDeleteFormPage,
  User,
  LogInFormPage
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/login', function()
  {
    viewport.showPage(new LogInFormPage());
  });

  router.map('/users;settings', user.auth('USERS:MANAGE'), function(req)
  {
    viewport.loadPage(['app/users/pages/UserSettingsPage'], function(UserSettingsPage)
    {
      return new UserSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

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
        ['app/users/pages/UserDetailsPage'],
        function(UserDetailsPage)
        {
          return new UserDetailsPage({
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

  router.map(
    '/users/:id;edit',
    function(req, referer, next)
    {
      if (req.params.id === user.data._id)
      {
        next();
      }
      else
      {
        canManage(req, referer, next);
      }
    },
    function(req)
    {
      viewport.loadPage(
        ['app/users/pages/UserEditFormPage'],
        function(UserEditFormPage)
        {
          return new UserEditFormPage({
            model: new User({_id: req.params.id})
          });
        }
      );
    }
  );

  router.map('/users/:id;delete', canManage, showDeleteFormPage.bind(null, User));
});
