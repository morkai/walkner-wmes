// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/AddFormPage',
  '../storage',
  '../views/FormView'
], function(
  _,
  bindLoadingMessage,
  AddFormPage,
  storage,
  FormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: FormView,

    baseBreadcrumb: '#fap/entries',

    destroy: function()
    {
      AddFormPage.prototype.destroy.apply(this, arguments);

      storage.release();
    },

    defineModels: function()
    {
      AddFormPage.prototype.defineModels.apply(this, arguments);

      this.categories = bindLoadingMessage(storage.acquire(), this);
    },

    load: function(when)
    {
      return when(
        this.categories.isEmpty() ? this.categories.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.apply(this, arguments);

      storage.acquire();
    },

    getFormViewOptions: function()
    {
      return _.assign(AddFormPage.prototype.getFormViewOptions.apply(this, arguments), {
        categories: this.categories
      });
    }

  });
});
