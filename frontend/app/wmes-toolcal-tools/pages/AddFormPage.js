// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../dictionaries',
  '../views/FormView'
], function(
  AddFormPage,
  dictionaries,
  FormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    FormView: FormView,

    load: function(when)
    {
      return when(dictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
