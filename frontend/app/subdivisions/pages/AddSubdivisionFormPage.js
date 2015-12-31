// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/pages/AddFormPage',
  '../views/SubdivisionFormView'
], function(
  $,
  AddFormPage,
  SubdivisionFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: SubdivisionFormView,

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
