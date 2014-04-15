// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/core/pages/EditFormPage',
  '../views/ProdTaskFormView'
], function(
  $,
  EditFormPage,
  ProdTaskFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdTaskFormView,

    load: function(when)
    {
      var model = this.model;

      return when(
        this.model.fetch(this.options.fetchOptions),
        $.ajax({
          url: '/prodTaskTags',
          success: function(allTags)
          {
            model.allTags = allTags;
          }
        })
      );
    }

  });
});
