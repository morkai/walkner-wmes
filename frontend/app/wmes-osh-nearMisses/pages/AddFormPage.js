// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/wmes-osh-common/dictionaries',
  '../views/FormView'
], function(
  AddFormPage,
  dictionaries,
  FormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView,

    pageClassName: 'page-max-flex',

    initialize: function()
    {
      AddFormPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    }

  });
});
