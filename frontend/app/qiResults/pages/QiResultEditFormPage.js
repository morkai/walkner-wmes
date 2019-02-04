// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/qiResults/dictionaries',
  '../views/QiResultFormView'
], function(
  EditFormPage,
  qiDictionaries,
  QiResultFormView
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    FormView: QiResultFormView,

    load: function(when)
    {
      return when(this.model.fetch(), qiDictionaries.load());
    },

    destroy: function()
    {
      EditFormPage.prototype.destroy.call(this);

      qiDictionaries.unload();
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.call(this);

      qiDictionaries.load();
    }

  });
});
