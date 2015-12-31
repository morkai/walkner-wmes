// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../dictionaries',
  '../views/KaizenOrderFormView'
], function(
  AddFormPage,
  kaizenDictionaries,
  KaizenOrderFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: true,
    FormView: KaizenOrderFormView,

    load: function(when)
    {
      return when(kaizenDictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();
    }

  });
});
