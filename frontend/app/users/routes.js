// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/View',
  '../core/util/showDeleteFormPage',
  './User',
  './UserCollection',
  './pages/LogInFormPage',
  './util/userInfoPopover',
  'i18n!app/nls/users'
], function(
  t,
  broker,
  router,
  viewport,
  user,
  View,
  showDeleteFormPage,
  User,
  UserCollection,
  LogInFormPage
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/login', function(req)
  {
    broker.publish('router.navigate', {
      url: '/',
      replace: true,
      trigger: false
    });

    viewport.showPage(new LogInFormPage({
      model: {unknown: req.query.unknown}
    }));
  });

  router.map('/users;settings', user.auth('USERS:MANAGE'), function(req)
  {
    viewport.loadPage(['app/users/pages/SettingsPage'], function(SettingsPage)
    {
      return new SettingsPage({
        initialTab: req.query.tab
      });
    });
  });

  router.map('/users', canView, function(req)
  {
    viewport.loadPage(['app/users/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new UserCollection(null, {rqlQuery: req.rql})
      });
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
      viewport.loadPage(['app/users/pages/DetailsPage'], function(DetailsPage)
      {
        return new DetailsPage({
          model: new User({_id: req.params.id})
        });
      });
    }
  );

  router.map(
    '/account',
    function()
    {
      viewport.loadPage(['app/users/pages/DetailsPage'], function(DetailsPage)
      {
        return new DetailsPage({
          model: new User({_id: user.data._id})
        });
      });
    }
  );

  router.map('/users;add', canManage, function()
  {
    viewport.loadPage(['app/users/pages/AddFormPage'], function(AddFormPage)
    {
      return new AddFormPage({
        model: new User()
      });
    });
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
      viewport.loadPage(['app/users/pages/EditFormPage'], function(EditFormPage)
      {
        return new EditFormPage({
          model: new User({_id: req.params.id})
        });
      });
    }
  );

  router.map('/users/:id;delete', canManage, showDeleteFormPage.bind(null, User));
});
