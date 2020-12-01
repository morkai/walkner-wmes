// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-workplaces/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpDivisionSelect2();
    },

    setUpDivisionSelect2: function()
    {
      this.$id('division').select2({
        width: '100%',
        data: dictionaries.divisions.map(division => ({
          id: division.id,
          text: division.getLabel({long: true})
        }))
      });
    }

  });
});
