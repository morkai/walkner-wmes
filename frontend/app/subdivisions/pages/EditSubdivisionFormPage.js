define([
  'jquery',
  'app/core/pages/EditFormPage',
  '../views/SubdivisionFormView'
], function(
  $,
  EditFormPage,
  SubdivisionFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: SubdivisionFormView,

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
