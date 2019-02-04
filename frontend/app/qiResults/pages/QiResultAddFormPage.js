// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/qiResults/dictionaries',
  '../views/QiResultFormView'
], function(
  AddFormPage,
  qiDictionaries,
  QiResultFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    FormView: QiResultFormView,

    load: function(when)
    {
      return when(qiDictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      qiDictionaries.unload();
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      qiDictionaries.load();
    }

  });
});
