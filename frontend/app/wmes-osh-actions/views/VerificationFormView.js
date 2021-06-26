// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  './FormView'
], function(
  viewport,
  FormView
) {
  'use strict';

  return FormView.extend({

    options: {

      editMode: true,

      hidden: {
        subject: true,
        creator: true,
        kind: true,
        orgUnits: true,
        categories: true,
        implementers: true,
        descriptions: true
      }

    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('solution')[0].labels[0].classList.add('is-required');

      this.$id('save').attr('tabindex', '-1').css({
        position: 'absolute',
        left: '-9999px'
      });
      this.$id('cancelled').remove();
    },

    onDialogShown: function()
    {
      this.$id('solution').focus();
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
