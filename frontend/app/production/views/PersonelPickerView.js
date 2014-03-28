define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/production/templates/personelPicker'
], function(
  _,
  t,
  viewport,
  View,
  setUpUserSelect2,
  personelPickerTemplate
) {
  'use strict';

  return View.extend({

    template: personelPickerTemplate,

    dialogClassName: 'production-modal',

    localTopics: {
      'socket.connected': 'render',
      'socket.disconnected': 'render'
    },

    events: {
      'keypress .select2-container': function(e)
      {
        if (e.which === 13)
        {
          this.$el.submit();

          e.preventDefault();
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$('.btn-primary')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var userInfo = {
          id: null,
          label: null
        };

        if (this.socket.isConnected())
        {
          var userData = this.$id('user').select2('data');

          if (userData)
          {
            userInfo.id = userData.id;
            userInfo.label = userData.name;
          }
        }
        else
        {
          userInfo.label = this.$id('user').val().trim().replace(/[^0-9]+/g, '');
        }

        this.trigger(
          'userPicked', userInfo.label === null || !userInfo.label.length ? null : userInfo
        );
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('personelPicker');
    },

    serialize: function()
    {
      var offline = !this.socket.isConnected();

      return {
        idPrefix: this.idPrefix,
        offline: offline,
        label: t('production', 'personelPicker:' + (offline ? 'offline' : 'online') + ':label'),
        placeholder:
          t('production', 'personelPicker:' + (offline ? 'offline' : 'online') + ':placeholder')
      };
    },

    afterRender: function()
    {
      var $user = this.$id('user');

      if (this.socket.isConnected())
      {
        setUpUserSelect2($user.removeClass('form-control'), {
          dropdownCssClass: 'production-dropdown'
        });

        $user.select2('focus');
      }
      else
      {
        $user.focus();
      }
    },

    onDialogShown: function()
    {
      this.$id('user').focus().select2('focus');
    }

  });
});
