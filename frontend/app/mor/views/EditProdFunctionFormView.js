// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/users/User',
  'app/mor/templates/editProdFunctionForm'
], function(
  _,
  $,
  Sortable,
  t,
  viewport,
  View,
  idAndLabel,
  orgUnits,
  prodFunctions,
  User,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        var view = this;
        var $submit = view.$id('submit').prop('disabled', true);
        var params = {
          section: view.model.section._id,
          mrp: view.model.mrp._id,
          prodFunction: view.model.prodFunction.id,
          users: view.$id('users').val()
            .split(',')
            .map(function(userId) { return view.users[userId]; })
            .filter(function(u) { return !!u; })
        };

        view.model.mor.editProdFunction(params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'editProdFunction:failure')
            });

            $submit.prop('disabled', false);
          })
          .done(function()
          {
            view.closeDialog();
          });

        return false;
      }
    },

    initialize: function()
    {
      this.users = {};
    },

    destroy: function()
    {
      this.sortable.destroy();
      this.sortable = null;
    },

    serialize: function()
    {
      var model = this.model;
      var prodFunction = model.prodFunction;
      var global = model.mor.isGlobalProdFunction(prodFunction.id);
      var common = model.mor.isCommonProdFunction(prodFunction.id);

      return {
        idPrefix: this.idPrefix,
        section: global ? t('mor', 'editProdFunction:section:all') : model.section.name,
        mrp: global || common ? t('mor', 'editProdFunction:mrp:all') : model.mrp._id,
        prodFunction: prodFunction.getLabel()
      };
    },

    afterRender: function()
    {
      var view = this;
      var model = view.model;
      var mor = model.mor;
      var users = mor.getUsers(model.section._id, model.mrp._id, model.prodFunction.id)
        .map(function(userId) { return mor.users.get(userId); })
        .filter(function(user) { return !!user; });
      var userIds = users.map(function(user) { return user.id; });
      var data = users.map(idAndLabel);
      var $users = view.$id('users');

      users.forEach(function(user)
      {
        view.users[user.id] = user.toJSON();
      });

      $users.val(userIds.join(','));

      view.setUpUsersSelect2(data);

      view
        .ajax({url: '/users?exclude(privileges)&sort(searchName)&limit(999)&prodFunction=' + model.prodFunction.id})
        .done(function(res)
        {
          _.forEach(res.collection, function(user)
          {
            view.users[user._id] = user;

            if (!_.contains(userIds, user._id))
            {
              data.push(idAndLabel(new User(user)));
            }
          });

          if (data.length > userIds.length)
          {
            view.setUpUsersSelect2(data);
          }
        });
    },

    setUpUsersSelect2: function(data)
    {
      if (this.sortable)
      {
        this.sortable.destroy();
      }

      var $users = this.$id('users').select2({
        allowClear: true,
        multiple: true,
        data: data
      });

      this.sortable = new Sortable($users.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $users.select2('onSortStart');
        },
        onEnd: function()
        {
          $users.select2('onSortEnd').select2('focus');
        }
      });

      $users.select2('focus');
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('users').select2('focus');
    },

    closeDialog: function() {}

  });
});
