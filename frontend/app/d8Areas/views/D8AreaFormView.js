// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/d8Areas/templates/form'
], function(
  FormView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('name').focus();
      }

      this.setUpManagerSelect2();
    },

    setUpManagerSelect2: function()
    {
      var manager = this.model.get('manager');
      var $manager = setUpUserSelect2(this.$id('manager'), {
        textFormatter: function(user, name) { return name;}
      });

      if (manager)
      {
        $manager.select2('data', {
          id: manager.id,
          text: manager.label
        });
      }
    },

    serializeForm: function(formData)
    {
      var manager = this.$id('manager').select2('data');

      formData.manager = !manager ? null : {
        id: manager.id,
        label: manager.text
      };

      return formData;
    }

  });
});
