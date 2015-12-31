// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  '../dictionaries',
  '../views/EmployeeCountFormView'
], function(
  EditFormPage,
  dictionaries,
  EmployeeCountFormView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: true,
    FormView: EmployeeCountFormView,

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
