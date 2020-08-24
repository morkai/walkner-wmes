// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-entries/templates/details/addFunc'
], function(
  viewport,
  View,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submit();

        return false;
      },

      'change #-func': function()
      {
        var func = this.$id('func').val();

        this.$id('users').select2('data', []);

        if (func.length)
        {
          this.loadFuncUsers();
        }
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:funcs', this.setUpFuncSelect2);
    },

    afterRender: function()
    {
      this.setUpFuncSelect2();

      setUpUserSelect2(this.$id('users'), {
        multiple: true,
        allowClear: true,
        noPersonnelId: true
      });
    },

    setUpFuncSelect2: function()
    {
      var view = this;
      var current = view.$id('func').val();
      var available = {};

      dictionaries.funcs.forEach(function(func)
      {
        if (!view.model.getFunc(func.id))
        {
          available[func.id] = {
            id: func.id,
            text: func.getLabel()
          };
        }
      });

      if (!available[current])
      {
        view.$id('func').val('');
      }

      view.$id('func').select2({
        width: '100%',
        data: Object.values(available)
      });
    },

    onDialogShown: function()
    {
      this.$id('func').focus();
    },

    submit: function()
    {
      var view = this;

      viewport.msg.saving();

      view.$('.btn-primary').prop('disabled', true);

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';add-func',
        data: JSON.stringify({
          func: view.$id('func').val(),
          users: setUpUserSelect2.getUserInfo(view.$id('users'))
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$('.btn-primary').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    },

    loadFuncUsers: function()
    {
      var view = this;

      viewport.msg.loading();

      var req = view.ajax({
        url: '/compRel/entries;resolve-users',
        data: {
          funcs: view.$id('func').val(),
          mrps: view.$id('mrps').val()
        }
      });

      req.done(function(funcs)
      {
        Object.keys(funcs).forEach(function(funcId)
        {
          view.updateFuncUsers(funcs[funcId]);
        });
      });

      req.always(function()
      {
        viewport.msg.loaded();
      });
    },

    updateFuncUsers: function(users)
    {
      users.sort(function(a, b)
      {
        return a.label.localeCompare(b.label, undefined, {ignorePunctuation: true});
      });

      this.$id('users').select2('data', users.map(function(u)
      {
        return {
          id: u.id,
          text: u.label
        };
      }));
    }

  });
});
