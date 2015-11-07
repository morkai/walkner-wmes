// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/AddFormPage',
  'app/kaizenOrders/dictionaries',
  '../views/SuggestionFormView'
], function(
  AddFormPage,
  kaizenDictionaries,
  SuggestionFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: true,
    FormView: SuggestionFormView,

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
