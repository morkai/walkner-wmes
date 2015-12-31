// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/pages/AddFormPage',
  '../ProdTaskCollection',
  '../views/ProdTaskFormView'
], function(
  $,
  AddFormPage,
  ProdTaskCollection,
  ProdTaskFormView
) {
  'use strict';

  return AddFormPage.extend({

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

      return when(allTasksReq, allTagsReq);
    }

  });
});
