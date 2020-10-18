// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/wmes-osh-common/dictionaries'
], function(
  AddFormPage,
  dictionaries
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    initialize: function()
    {
      AddFormPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    }

  });
});
