// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/ListView',
  'app/xiconfPrograms/util/buildStepLabels'
], function(
  time,
  ListView,
  buildStepLabels
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable',

    remoteTopics: {
      'xiconf.results.**': 'refreshCollection'
    },

    columns: [
      {id: 'srcId', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'order', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'serviceTag', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'nc12', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'counter', className: 'is-min is-number'},
      {id: 'quantity', className: 'is-min is-number'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'prodLine', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'programName', className: 'is-min'},
      'programSteps'
    ],

    serializeActions: function()
    {
      return null;
    },

    serializeRow: function(model)
    {
      var order = model.get('order');
      var program = model.get('program');
      var serviceTag = model.get('serviceTag');
      var className = ['xiconf-entry', model.get('result') === 'success' ? 'success' : 'danger'];

      if (model.get('cancelled'))
      {
        className.push('is-cancelled');
      }

      return {
        _id: model.id,
        className: className.join(' '),
        srcId: model.get('srcId'),
        serviceTag: serviceTag ? ('...' + serviceTag.substr(-4)) : '',
        order: model.get('orderNo'),
        programName: program ? program.name : (model.get('programName') || ''),
        programSteps: program ? buildStepLabels(program.steps, model.get('steps')) : '',
        prodLine: model.get('prodLine'),
        nc12: model.get('nc12'),
        counter: model.get('counter'),
        quantity: order ? order.quantity : '',
        startedAt: time.format(model.get('startedAt'), 'L, LTS'),
        duration: time.toString(model.get('duration') / 1000, false, true)
      };
    }

  });
});
