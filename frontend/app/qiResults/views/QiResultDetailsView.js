// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/details',
  'app/qiResults/templates/correctiveActionsTable'
], function(
  _,
  DetailsView,
  qiDictionaries,
  template,
  renderCorrectiveActionsTable
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    serialize: function()
    {
      return _.assign(DetailsView.prototype.serialize.call(this), {
        renderCorrectiveActionsTable: renderCorrectiveActionsTable
      });
    },

    serializeDetails: function(model)
    {
      return model.serializeDetails(qiDictionaries);
    }

  });
});
