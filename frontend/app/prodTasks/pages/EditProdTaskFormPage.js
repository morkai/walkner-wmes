// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/pages/EditFormPage',
  '../ProdTaskCollection',
  '../views/ProdTaskFormView'
], function(
  $,
  EditFormPage,
  ProdTaskCollection,
  ProdTaskFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: ProdTaskFormView,

    load: function(when)
    {
      var model = this.model;

      model.allTags = [];
      model.allTasks = new ProdTaskCollection();

      var allTasksReq = model.allTasks.fetch({reset: true});

      var allTagsReq = $.ajax({
        url: '/prodTaskTags',
        success: function(allTags)
        {
          model.allTags = allTags;
        }
      });

      return when(model.fetch(this.options.fetchOptions), allTasksReq, allTagsReq);
    }

  });
});
