// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  'app/mor/templates/editMrpForm'
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
          division: view.model.divisionId,
          mrp: view.model.mrpId,
          prodFunction: view.model.prodFunctionId,
          users: view.$id('users').val().split(',').map(function(userId) { return view.users[userId]; })
        };

        view.model.mor.editMrp(params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'editMrp:failure')
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
      return {
        idPrefix: this.idPrefix,
        division: orgUnits.getByTypeAndId('division', this.model.divisionId).get('description'),
        mrp: this.model.mrpId || t('mor', 'editMrp:mrp:all'),
        prodFunction: prodFunctions.get(this.model.prodFunctionId).getLabel()
      };
    },

    afterRender: function()
    {
      var view = this;
      var model = view.model;
      var mor = model.mor;
      var users = mor.getUsers(model.divisionId, model.mrpId, model.prodFunctionId)
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
        .ajax({url: '/users?exclude(privileges)&sort(searchName)&limit(999)&prodFunction=' + model.prodFunctionId})
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
