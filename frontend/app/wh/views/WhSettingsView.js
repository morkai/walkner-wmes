// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/util/idAndLabel',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/users/util/setUpUserSelect2',
  'app/settings/views/SettingsView',
  '../WhUser',
  'app/wh/templates/settings'
], function(
  _,
  user,
  idAndLabel,
  setUpMrpSelect2,
  setUpUserSelect2,
  SettingsView,
  WhUser,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#wh/settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },
      'change input[data-user-func]': function(e)
      {
        var func = e.currentTarget.dataset.userFunc;

        if (e.added)
        {
          this.addUser(e.added, func);
        }
        else if (e.removed)
        {
          this.removeUser(e.removed, func);
        }
      },
      'dblclick .select2-search-choice > div': function(e)
      {
        if (!user.isAllowedTo('USERS:VIEW'))
        {
          return;
        }

        var name = e.currentTarget.textContent.trim();
        var whUser = this.whUsers.find(function(whUser) { return whUser.get('label') === name; });

        if (!whUser)
        {
          return;
        }

        window.open('#users/' + whUser.id);
      }
    }, SettingsView.prototype.events),

    initialize: function()
    {
      SettingsView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.whUsers, 'add remove', this.onUserUpdated);
      this.listenTo(this.whUsers, 'change:func', this.onFuncChanged);
    },

    afterRender: function()
    {
      var view = this;

      SettingsView.prototype.afterRender.apply(view, arguments);

      setUpMrpSelect2(view.$id('planning-ignoredMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: true,
        own: false,
        view: this
      });

      this.$('input[data-user-func]').each(function()
      {
        setUpUserSelect2(view.$(this), {
          width: '100%',
          multiple: true,
          allowClear: true,
          placeholder: ' ',
          noPersonnelId: true
        });

        view.updateUsers(this.dataset.userFunc);
      });
    },

    toggleTabPrivileges: function()
    {
      this.$('.list-group-item[data-privileges]').each(function()
      {
        var requiredPrivileges = this.dataset.privileges.split(',');

        for (var i = 0; i < requiredPrivileges.length; ++i)
        {
          if (!user.isAllowedTo(requiredPrivileges[i]))
          {
            this.classList.add('disabled');
          }
        }
      });
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return setting.id !== 'wh.planning.ignoredMrps';
    },

    updateSettingField: function(setting)
    {
      if (setting && setting.id === 'wh.planning.ignoredMrps')
      {
        this.$id('planning-ignoredMrps').select2('data', setting.getValue().map(function(mrp)
        {
          return {id: mrp, text: mrp};
        }));
      }
    },

    addUser: function(user, func)
    {
      var view = this;
      var whUser = view.whUsers.get(user.id);

      if (whUser)
      {
        if (whUser.get('func') === func)
        {
          return;
        }

        this.promised(whUser.save({func: func}));
      }
      else
      {
        whUser = new WhUser({
          _id: user.id,
          label: user.text,
          func: func
        });

        whUser.id = null;

        view.promised(whUser.save()).done(function()
        {
          view.whUsers.add(whUser);
        });
      }
    },

    removeUser: function(user, func)
    {
      var whUser = this.whUsers.get(user.id);

      if (whUser && whUser.get('func') === func)
      {
        whUser.destroy();
      }
    },

    updateUsers: function(func)
    {
      this.$('input[data-user-func="' + func + '"]').select2('data', this.whUsers
        .filter(function(user) { return user.get('func') === func; })
        .map(idAndLabel));
    },

    onUserUpdated: function(user)
    {
      this.updateUsers(user.get('func'));
    },

    onFuncChanged: function(user)
    {
      if (user.hasChanged('func'))
      {
        this.updateUsers(user.previous('func'));
        this.updateUsers(user.get('func'));
      }
    }

  });
});
