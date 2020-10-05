// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/wmes-osh-common/dictionaries',
  '../views/FormView'
], function(
  EditFormPage,
  dictionaries,
  FormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView,

    initialize: function()
    {
      EditFormPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    }

  });
});
