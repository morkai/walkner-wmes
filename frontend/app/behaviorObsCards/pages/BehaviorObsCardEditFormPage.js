// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/BehaviorObsCardFormView'
], function(
  EditFormPage,
  kaizenDictionaries,
  BehaviorObsCardFormView
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    baseBreadcrumb: true,
    FormView: BehaviorObsCardFormView,

    load: function(when)
    {
      return when(this.model.fetch(), kaizenDictionaries.load());
    },

    destroy: function()
    {
      EditFormPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();
    }

  });
});
