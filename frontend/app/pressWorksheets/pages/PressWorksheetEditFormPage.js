// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/lossReasons/LossReasonCollection',
  '../views/PressWorksheetFormView'
], function(
  EditFormPage,
  LossReasonCollection,
  PressWorksheetFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: PressWorksheetFormView,

    load: function(when)
    {
      this.model.lossReasons = new LossReasonCollection(null, {
        rqlQuery: 'select(label)&sort(position)&position>=0'
      });

      return when(
        this.model.fetch(),
        this.model.lossReasons.fetch({reset: true})
      );
    }

  });
});
