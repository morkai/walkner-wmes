// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/users/util/setUpUserSelect2',
  'app/wmes-fap-entries/templates/quickUsersForm'
], function(
  $,
  FormView,
  idAndLabel,
  prodFunctions,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    nlsDomain: 'wmes-fap-entries',

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('funcs').select2({
        width: '100%',
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('users'), {
        view: this,
        multiple: true,
        currentUserInfo: this.model.get('users')
      });
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.funcs = formData.funcs.join(',');
      formData.users = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.funcs = (formData.funcs || '').split(',').filter(v => !!v);

      formData.users = setUpUserSelect2.getUserInfo(this.$id('users'));

      return formData;
    },

    request: function(formData)
    {
      this.model.set(formData);

      return $.Deferred().resolve();
    },

    handleSuccess: function()
    {
      this.trigger('save', this.model.toJSON());
    }

  });
});
