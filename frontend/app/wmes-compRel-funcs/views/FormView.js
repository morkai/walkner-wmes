// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/data/prodFunctions',
  'app/users/util/setUpUserSelect2',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-funcs/templates/form'
], function(
  FormView,
  prodFunctions,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(prodFunctions, 'change', this.setUpFuncsSelect2);
        this.listenTo(dictionaries.funcs, 'change', this.setUpFuncsSelect2);
      });
    },

    serializeModel: function()
    {
      return {
        name: this.model.getLabel()
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.users = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.users = setUpUserSelect2.getUserInfo(this.$id('users'));

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpFuncsSelect2();
      this.setUpUsersSelect2();
    },

    setUpFuncsSelect2: function()
    {
      var selected = this.$id('_id').val();
      var data = prodFunctions.map(function(f)
      {
        var disabled = !!dictionaries.funcs.get(f.id);

        if (disabled && selected === f.id)
        {
          selected = '';
        }

        return {
          id: f.id,
          text: f.getLabel(),
          disabled: disabled
        };
      });

      this.$id('_id').val(selected).select2({
        data: data
      });
    },

    setUpUsersSelect2: function()
    {
      var $users = setUpUserSelect2(this.$id('users'), {
        noPersonnelId: true,
        multiple: true
      });

      $users.select2('data', this.model.get('users').map(function(u)
      {
        return {
          id: u.id,
          text: u.label
        };
      }));
    }

  });
});
