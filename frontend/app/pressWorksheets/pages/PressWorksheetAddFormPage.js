define([
  'jquery',
  'app/core/pages/AddFormPage',
  'app/lossReasons/LossReasonCollection',
  '../views/PressWorksheetFormView'
], function(
  $,
  AddFormPage,
  LossReasonCollection,
  PressWorksheetFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: PressWorksheetFormView,

    load: function(when)
    {
      this.model.lossReasons = new LossReasonCollection(null, {
        rqlQuery: 'select(label)&sort(position)&position>=0'
      });

      return when(this.model.lossReasons.fetch({reset: true}));
    }

  });
});
