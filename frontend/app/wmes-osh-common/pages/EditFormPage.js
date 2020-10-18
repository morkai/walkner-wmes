// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/wmes-osh-common/dictionaries'
], function(
  EditFormPage,
  dictionaries
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    initialize: function()
    {
      EditFormPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    }

  });
});
