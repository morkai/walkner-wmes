// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/EditFormPage',
  '../storage',
  '../views/FormView'
], function(
  _,
  bindLoadingMessage,
  EditFormPage,
  storage,
  FormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: FormView,

    baseBreadcrumb: '#fap/entries',

    destroy: function()
    {
      EditFormPage.prototype.destroy.apply(this, arguments);

      storage.release();
    },

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.apply(this, arguments);

      this.categories = bindLoadingMessage(storage.acquire(), this);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.categories.isEmpty() ? this.categories.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.apply(this, arguments);

      storage.acquire();
    },

    getFormViewOptions: function()
    {
      return _.assign(EditFormPage.prototype.getFormViewOptions.apply(this, arguments), {
        categories: this.categories
      });
    }

  });
});
