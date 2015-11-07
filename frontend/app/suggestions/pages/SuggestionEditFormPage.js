// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/EditFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/SuggestionFormView'
], function(
  EditFormPage,
  kaizenDictionaries,
  SuggestionFormView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: true,
    FormView: SuggestionFormView,

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
