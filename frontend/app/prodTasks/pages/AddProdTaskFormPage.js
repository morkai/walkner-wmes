// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
