define([
  'jquery',
  'app/core/pages/AddFormPage',
  '../views/ProdTaskFormView'
], function(
  $,
  AddFormPage,
  ProdTaskFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: ProdTaskFormView,

    load: function(when)
    {
      var model = this.model;

      return when($.ajax({
        url: '/prodTaskTags',
        success: function(allTags)
        {
          model.allTags = allTags;
        }
      }));
    }

  });
});
