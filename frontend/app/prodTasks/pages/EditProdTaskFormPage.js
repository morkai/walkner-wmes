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
