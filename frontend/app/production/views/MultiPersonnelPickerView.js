// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/production/templates/multiPersonnelPicker'
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

    dialogClassName: 'production-modal production-multiPersonnelPicker-modal',

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
      'focus #-picker-user': function()
      {
        this.setUpEmbeddedField();
      },
      'click #-picked-switch': function()
      {
        var $user = this.$id('picker-user');

        $user.val('').select2('data', []);

        if (this.options.embedded)
        {
          this.onVkbValueChange();
        }
        else
        {
          this.setUpList();
        }

        this.$el.addClass('is-picking');
        $user.focus().select2('focus');
      },
      'click #-picker-switch': function()
      {
        this.switchToPicked();
      },
      'click #-picker-submit': function()
      {
        var view = this;

        if (view.socket.isConnected())
        {
          if (view.options.embedded)
          {
            var $active = view.$id('picker-list').find('.active');

            if ($active.length)
            {
              view.addUser({
                id: $active[0].dataset.id,
                label: $active.text().trim()
              });
            }
          }
          else
          {
            (view.$id('picker-user').select2('data') || []).forEach(function(user)
            {
              view.addUser({
                id: user.id,
                label: user.text
              });
            });
          }
        }
        else
        {
          var personnelId = view.$id('picker-user').val().replace(/[^0-9]+/g, '');

          if (personnelId.length)
          {
            view.addUser({
              id: null,
              label: personnelId
            });
          }
        }

        view.switchToPicked();
      },
      'click .btn[data-action="removeUser"]': function(e)
      {
        this.$(e.currentTarget).parent().remove();

        this.togglePickedSwitch();

        var $list = this.$id('picked-list');

        if (!$list[0].childElementCount)
        {
          $list.html('<p>' + t('production', 'multiPersonnelPicker:empty') + '</p>');
        }
      },
      'click .btn[data-id]': function(e)
      {
        var $active = this.$(e.currentTarget);

        $active.parent().find('.active').removeClass('active');
        $active.addClass('active');
      },
      'input #-picker-user': function()
      {
        if (this.options.embedded)
        {
          this.onVkbValueChange();
        }
      },
      'click .btn[value]': function(e)
      {
        var $item = this.$(e.currentTarget).parent().detach();

        this.$id('picked-list').prepend($item);
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$id('picked-submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var users = [];

        this.$('.btn[value]').each(function()
        {
          var id = this.value;
          var label = this.textContent.trim();

          users.push({
            id: id === label ? null : id,
            label: label
          });
        });

        this.trigger('usersPicked', users);
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

    getTemplateData: function()
    {
      var offline = !this.socket.isConnected();
      var labelType = offline ? 'offline' : this.options.embedded ? 'embedded' : 'online';

      return {
        offline: offline,
        label: t('production', 'multiPersonnelPicker:' + labelType + ':label')
      };
    },

    afterRender: function()
    {
      this.setUpField();
      this.setUpList();

      var user = this.model.get(this.options.type);
      var users = this.model.get(this.options.type + 's');

      if (!Array.isArray(users))
      {
        users = [];
      }

      if (user && !users.length)
      {
        this.model[this.options.type + 's'] = users = [user];
      }

      users.forEach(this.addUser, this);

      if (users.length === 0)
      {
        this.$id('picked-switch').click();
      }
    },

    setUpField: function()
    {
      var view = this;

      if (view.options.embedded)
      {
        return;
      }

      var $user = view.$id('picker-user');

      if (view.socket.isConnected())
      {
        var $list = view.$id('picked-list');

        setUpUserSelect2($user.removeClass('form-control'), {
          multiple: true,
          sortable: true,
          dropdownCssClass: 'production-dropdown',
          userFilter: function(user)
          {
            return $list.find('.btn[value="' + user._id + '"]').length === 0;
          }
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
      if (this.options.vkb)
      {
        this.options.vkb.show(
          this.$id('picker-user').addClass('is-embedded')[0],
          this.onVkbValueChange.bind(this)
        );
      }
    },

    onVkbValueChange: function()
    {
      var offline = !this.socket.isConnected();
      var phrase = this.$id('picker-user').val();

      if (offline)
      {
        phrase = phrase.replace(/[^0-9]+/g, '');
      }
      else
      {
        phrase = setUpUserSelect2.transliterate(phrase);
      }

      var $list = this.$id('picker-list');
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
        list = this.recentHtml || ('<p>' + t('production', 'multiPersonnelPicker:notFound') + '</p>');
      }

      $list.find('label').html(t('production', 'multiPersonnelPicker:' + label));
      $list.find('div').html(list).find('.btn').first().click();
      $list.removeClass('hidden');

      if (this.options.vkb)
      {
        this.options.vkb.reposition();
      }
    },

    setUpList: function()
    {
      var view = this;
      var $list = view.$id('picker-list');

      if (!this.socket.isConnected())
      {
        return $list.remove();
      }

      if (view.recentHtml !== undefined)
      {
        if (view.recentHtml.length)
        {
          var $pickedList = view.$id('pickedList');

          $list.find('.btn-group-vertical').html(view.recentHtml).children().each(function()
          {
            if ($pickedList.find('.btn[value="' + this.dataset.id + '"]').length)
            {
              this.parentNode.removeChild(this);
            }
          });

          if (view.options.vkb)
          {
            view.options.vkb.reposition();
          }
        }
        else
        {
          var $spinner = $list.find('.fa-spinner');

          if ($spinner.length)
          {
            $spinner.replaceWith(t('production', 'multiPersonnelPicker:notFound'));
          }
        }

        return;
      }

      view.recentHtml = '';

      view.ajax({
        url: '/production/getRecentPersonnel',
        data: {
          type: view.options.type + 's',
          prodLine: view.model.prodLine.id,
          shift: view.model.get('shift')
        }
      }).success(function(users)
      {
        users.sort(function(a, b)
        {
          return a.label.localeCompare(b.label, undefined, {numeric: true, ignorePunctuation: true});
        });

        users.forEach(function(user)
        {
          view.recentHtml += '<button type="button" class="btn btn-lg btn-default" data-id="' + user._id + '">'
            + _.escape(user.label)
            + '</button>';
        });
      }).always(function()
      {
        view.setUpList();
      });
    },

    buildPersonnelList: function(phrase)
    {
      var view = this;

      if (phrase.length < 3)
      {
        return '<p>' + t('production', 'multiPersonnelPicker:tooShort') + '</p>';
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
          + '&sort(searchName)&limit(999)&active=true'
          + '&searchName=regex=' + encodeURIComponent('^' + phrase)
      });

      view.searchReq.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      view.searchReq.done(function(res)
      {
        view.lastUsers = res.collection || [];

        var $list = view.$id('picker-list')
          .removeClass('hidden')
          .find('div')
          .html(view.buildFilteredPersonnelList());

        if (view.options.vkb)
        {
          view.options.vkb.reposition();
        }

        $list.first().click();
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
      var filter = setUpUserSelect2.transliterate(this.$id('picker-user').val() || '');
      var picked = {};

      this.$id('picked-list').find('.btn[value]').each(function()
      {
        picked[this.value] = true;
      });

      var users = this.lastUsers.filter(function(user)
      {
        return !picked[user._id] && user.searchName.indexOf(filter) === 0;
      });
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

      return html.length ? html : ('<p>' + t('production', 'multiPersonnelPicker:notFound') + '</p>');
    },

    addUser: function(user)
    {
      var $list = this.$id('picked-list');
      var id = user.id || user.label;

      if ($list.find('.btn[value="' + id + '"]').length)
      {
        return;
      }

      var html = '<div class="production-form-btn-group-item">'
        + '<button type="button" class="btn btn-default btn-lg" value="' + id + '">'
        + _.escape(user.label)
        + '</button>'
        + '<button type="button" class="btn btn-default btn-lg" data-action="removeUser">'
        + '<i class="fa fa-times"></i></button>'
        + '</div>';

      if ($list[0].firstElementChild.tagName === 'P')
      {
        $list.html('');
      }

      $list.append(html);

      this.togglePickedSwitch();

      if (this.options.vkb)
      {
        this.options.vkb.reposition();
      }
    },

    togglePickedSwitch: function()
    {
      this.$id('picked-switch').prop('disabled', this.$id('picked-list')[0].childElementCount === 7);
    },

    switchToPicked: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }

      this.$el.removeClass('is-picking');
    }

  });
});
