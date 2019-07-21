// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/wmes-drilling/templates/userPicker'
], function(
  _,
  t,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'drilling-userPicker-dialog',

    events: {
      'click .drilling-userPicker-user': function(e)
      {
        this.$('.active').removeClass('active');
        e.currentTarget.classList.add('active');
      },
      'click .btn-danger': function()
      {
        this.trigger('picked', null);
      },
      'submit': function()
      {
        var selected = this.$('.active')[0];
        var user = !selected ? null : {
          id: selected.dataset.id,
          label: selected.textContent.trim()
        };

        this.trigger('picked', user);

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        maxHeight: this.calcHeight()
      };
    },

    calcHeight: function()
    {
      return window.innerHeight - 62 - 65;
    },

    afterRender: function()
    {
      this.loadUsers();
    },

    loadUsers: function()
    {
      var view = this;

      view.$id('users').html('<i class="fa fa-spinner fa-spin"></i>');

      var req = view.ajax({
        url: '/users?select(login,firstName,lastName,searchName)'
          + '&privileges=in=(DRILLING%3ADRILLER,DRILLING%3AMANAGE)'
      });

      req.fail(function()
      {
        view.$id('users').find('.fa-spinner').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        view.renderUsers(res.collection || []);
      });
    },

    renderUsers: function(users)
    {
      users = users.map(function(user)
      {
        var label = user.lastName;

        if (user.firstName)
        {
          if (label)
          {
            label += ' ';
          }

          label += user.firstName;
        }
        else
        {
          label = user.login;
        }

        return {
          id: user._id,
          label: label
        };
      });

      users.sort(function(a, b)
      {
        return a.label.localeCompare(b.label, undefined, {ignorePunctuation: true});
      });

      var items = users.map(function(user)
      {
        return '<div class="drilling-userPicker-user" data-id="' + user.id + '">' + _.escape(user.label) + '</div>';
      });

      this.$id('users').html(items);

      if (this.model.user)
      {
        this.$('.drilling-userPicker-user[data-id="' + this.model.user.id + '"]').click();
      }
    }

  });
});
