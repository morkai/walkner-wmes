// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../dictionaries',
  '../views/D8EntryFormView'
], function(
  EditFormPage,
  dictionaries,
  D8EntryFormView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: true,
    FormView: D8EntryFormView,

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    destroy: function()
    {
      EditFormPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
