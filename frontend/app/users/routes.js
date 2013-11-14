define([
  '../router',
  '../viewport',
  '../user',
  './User',
  './UserCollection',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/UserFormView',
  'app/users/templates/details',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  user,
  User,
  UserCollection,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  UserFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/users', canView, function(req)
  {
    viewport.showPage(new ListPage({
      collection: new UserCollection(null, {rqlQuery: req.rql}),
      columns: ['login', 'email', 'mobile']
    }));
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
      viewport.showPage(new DetailsPage({
        model: new User({_id: req.params.id}),
        detailsTemplate: detailsTemplate
      }));
    }
  );

  router.map('/users;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: UserFormView,
      model: new User()
    }));
  });

  router.map('/users/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: UserFormView,
      model: new User({_id: req.params.id})
    }));
  });

  router.map('/users/:id;delete', canManage, function(req, referer)
  {
    var model = new User({_id: req.params.id});

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
