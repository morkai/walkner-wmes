// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      'click .btn[data-id]': function(e)
      {
        this.trigger('userPicked', {
          id: e.currentTarget.dataset.id,
          label: e.currentTarget.textContent.trim()
        });
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

      var $list = this.$id('list');

      this.ajax({
        url: '/production/getRecentPersonnel',
        data: {
          type: this.options.type,
          prodLine: this.model.prodLine.id,
          shift: this.model.get('shift')
        }
      }).success(function(users)
      {
        var html = '';

        users.forEach(function(user)
        {
          html += '<button type="button" class="btn btn-lg btn-default" data-id="' + user._id + '">'
            + _.escape(user.label)
            + '</button>';
        });

        if (html.length)
        {
          $list.find('.btn-group-vertical').html(html);
          $list.removeClass('hidden');
        }
      });
    },

    onDialogShown: function()
    {
      this.$id('user').focus().select2('focus');
    }

  });
});
