// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/isa/templates/shiftPersonnel'
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

    events: {
      'submit': function()
      {
        var users = this.$id('users').select2('data').map(function(item)
        {
          return {
            id: item.id,
            label: item.text
          };
        });

        var req = this.model.save({users: users}, {wait: true});

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 4000,
            text: t('isa', 'shiftPersonnel:msg:failure')
          });
        });

        req.done(function()
        {
          viewport.msg.show({
            type: 'success',
            time: 2000,
            text: t('isa', 'shiftPersonnel:msg:success')
          });
        });

        return false;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        users: this.model.get('users').map(function(user) { return user.id; }).join(',')
      };
    },

    afterRender: function()
    {
      var view = this;
      var url = '/users'
        + '?select(firstName,lastName,login)'
        + '&sort(lastName,firstName)'
        + '&limit(100)'
        + '&privileges=' + encodeURIComponent('ISA:WHMAN');

      this.ajax({url: url}).done(function(res)
      {
        var items = [];

        _.forEach(res.collection, function(user)
        {
          var text = user.login;

          if (user.lastName)
          {
            text = user.lastName;

            if (user.firstName)
            {
              text += ' ' + user.firstName;
            }
          }

          items.push({id: user._id, text: text});
        });

        view.setUpSelect2(items);
      });

      this.setUpSelect2(this.model.get('users').map(function(user)
      {
        return {
          id: user.id,
          text: user.label
        };
      }));
    },

    setUpSelect2: function(data)
    {
      this.$id('users').select2({
        allowClear: true,
        multiple: true,
        data: data
      });
    },

    onDialogShown: function()
    {
      this.$id('users').select2('focus');
    }

  });
});
