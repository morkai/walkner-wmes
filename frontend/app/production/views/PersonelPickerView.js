// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/production/templates/personelPicker'
], function(
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
            userInfo.label = userData.text;
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

    serialize: function()
    {
      var offline = !this.socket.isConnected();

      return {
        idPrefix: this.idPrefix,
        offline: offline,
        label: t('production', 'personelPicker:' + (offline ? 'offline' : 'online') + ':label')
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
        $user.attr('placeholder', t('production', 'personelPicker:offline:placeholder')).focus();
      }
    },

    onDialogShown: function()
    {
      this.$id('user').focus().select2('focus');
    }

  });
});
