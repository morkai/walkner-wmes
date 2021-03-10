// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-employments/templates/observerEditor'
], function(
  View,
  setUpUserSelect2,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-employments',

    events: {

      'submit': function(e)
      {
        e.preventDefault();

        const users = this.$id('users')
          .select2('data')
          .map(item => ({id: item.id, label: item.text}))
          .sort((a, b) => a.label.localeCompare(b.label));

        this.trigger('picked', users);
      }

    },

    getTemplateData: function()
    {
      return {
        orgUnit: this.model.orgUnit
      };
    },

    afterRender: function()
    {
      const $users = setUpUserSelect2(this.$id('users'), {
        view: this,
        multiple: true
      });

      if (this.model.users.length)
      {
        $users.select2('data', this.model.users.map(u => ({
          id: u.id,
          text: u.label
        })));
      }
    },

    onDialogShown: function()
    {
      this.$id('users').select2('focus');
    }

  });
});
