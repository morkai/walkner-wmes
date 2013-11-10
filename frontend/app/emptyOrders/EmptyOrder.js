define([
  'moment',
  'app/core/Model'
], function(
  moment,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/emptyOrders',

    clientUrlRoot: '#emptyOrders',

    labelProperty: '_id',

    nlsDomain: 'emptyOrders',

    defaults: {
      nc12: null,
      mrp: null,
      startDate: null,
      finishDate: null,
      statuses: null,
      createdAt: null
    },

    toJSON: function(options)
    {
      if (!options)
      {
        options = {};
      }

      var emptyOrder = Model.prototype.toJSON.call(this);

      if (emptyOrder.startDate)
      {
        emptyOrder.startDateText =
          moment(emptyOrder.startDate).format(options.startFinishDateFormat || 'LL');
      }

      if (emptyOrder.finishDate)
      {
        emptyOrder.finishDateText =
          moment(emptyOrder.finishDate).format(options.startFinishDateFormat || 'LL');
      }

      if (emptyOrder.createdAt)
      {
        emptyOrder.createdAtText = moment(emptyOrder.createdAt).format('LLLL');
      }

      return emptyOrder;
    }

  });
});
