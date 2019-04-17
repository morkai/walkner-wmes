// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  template
) {
  'use strict';

  return View.extend({

    template: template,

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
      'input #-user': function()
      {
        if (this.options.embedded)
        {
          this.onVkbValueChange();
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
          if (this.options.embedded)
          {
            this.$('.btn[data-id]').first().click();

            return;
          }

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

        this.trigger('userPicked', userInfo.label === null || !userInfo.label.length ? null : userInfo);
      }
    },

    initialize: function()
    {
      this.lastPhrase = '';
      this.lastUsers = [];
      this.searchReq = null;
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    serialize: function()
    {
      var offline = !this.socket.isConnected();
      var labelType = offline ? 'offline' : this.options.embedded ? 'embedded' : 'online';

      return {
        idPrefix: this.idPrefix,
        offline: offline,
        label: t('production', 'personelPicker:' + labelType + ':label')
      };
    },

    afterRender: function()
    {
      this.setUpField();
      this.setUpList();
    },

    onDialogShown: function()
    {
      this.$id('user').focus().select2('focus');
    },

    setUpField: function()
    {
      if (this.options.embedded)
      {
        return this.setUpEmbeddedField();
      }

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

    setUpEmbeddedField: function()
    {
      this.options.vkb.show(
        this.$id('user').addClass('is-embedded')[0],
        this.onVkbValueChange.bind(this)
      );
    },

    onVkbValueChange: function()
    {
      var offline = !this.socket.isConnected();
      var phrase = this.$id('user').val();

      if (offline)
      {
        phrase = phrase.replace(/[^0-9]+/g, '');
      }
      else
      {
        phrase = setUpUserSelect2.transliterate(phrase);
      }

      var $list = this.$id('list');
      var label = '';
      var list = '';

      if (!$list.length || (phrase.length < 3 && this.options.vkb))
      {
        this.options.vkb.enableKeys();
      }

      if (!$list.length)
      {
        return;
      }

      if (phrase.length)
      {
        label = 'matches';
        list = this.buildPersonnelList(phrase);

        if (!list.length)
        {
          list = '<p><i class="fa fa-spinner fa-spin"></i></p>';
        }
      }
      else
      {
        label = 'recent';
        list = this.recentHtml || ('<p>' + t('production', 'personelPicker:notFound') + '</p>');
      }

      $list.find('label').html(t('production', 'personelPicker:' + label));
      $list.find('div').html(list);
      $list.removeClass('hidden');
    },

    setUpList: function()
    {
      var view = this;
      var $list = view.$id('list');

      if (!this.socket.isConnected())
      {
        return $list.remove();
      }

      view.recentHtml = '';

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

          view.recentHtml = html;

          if (view.options.vkb)
          {
            view.options.vkb.reposition();
          }
        }
      }).always(function()
      {
        var $spinner = $list.find('.fa-spinner');

        if ($spinner.length)
        {
          $spinner.replaceWith(t('production', 'personelPicker:notFound'));
        }
      });
    },

    buildPersonnelList: function(phrase)
    {
      var view = this;

      if (phrase.length < 3)
      {
        return '<p>' + t('production', 'personelPicker:tooShort') + '</p>';
      }

      var prefix = phrase.substring(0, 3);

      if (prefix === view.lastPhrase)
      {
        return view.searchReq ? '' : this.buildFilteredPersonnelList();
      }

      if (view.searchReq)
      {
        view.searchReq.abort();
      }

      view.searchReq = this.ajax({
        url: '/users?select(firstName,lastName,searchName,personellId)'
          + '&sort(searchName)&limit(999)'
          + '&searchName=regex=' + encodeURIComponent('^' + phrase)
      });

      view.searchReq.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      view.searchReq.done(function(res)
      {
        view.lastUsers = res.collection || [];
        view.$id('list').removeClass('hidden').find('div').html(view.buildFilteredPersonnelList());

        if (view.options.vkb)
        {
          view.options.vkb.reposition();
        }
      });

      view.searchReq.always(function()
      {
        view.searchReq = null;
      });

      view.lastPhrase = prefix;

      return '';
    },

    buildFilteredPersonnelList: function()
    {
      var filter = setUpUserSelect2.transliterate(this.$id('user').val() || '');
      var users = this.lastUsers.filter(function(user) { return user.searchName.indexOf(filter) === 0; });
      var keys = {};
      var html = '';

      users.forEach(function(user)
      {
        var label = user.lastName || '';

        if (user.firstName.length)
        {
          if (label.length)
          {
            label += ' ';
          }

          label += user.firstName;
        }

        if (user.personellId)
        {
          if (label.length)
          {
            label += ' (' + user.personellId + ')';
          }
          else
          {
            label = user.personellId;
          }
        }

        html += '<button type="button" class="btn btn-lg btn-default" data-id="' + user._id + '">'
          + _.escape(label)
          + '</button>';

        var key = user.searchName.substr(filter.length, 1);

        if (key)
        {
          keys[key] = true;
        }
      });

      if (this.options.vkb)
      {
        this.options.vkb.disableKeys(keys);
      }

      return html.length ? html : ('<p>' + t('production', 'personelPicker:notFound') + '</p>');
    }

  });
});
