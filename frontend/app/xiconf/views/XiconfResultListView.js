// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      'xiconf.results.synced': 'refreshCollection'
    },

    columns: [
      {id: 'srcId', className: 'is-min'},
      {id: 'order', className: 'is-min'},
      {id: 'serviceTag', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      {id: 'counter', className: 'is-min'},
      {id: 'quantity', className: 'is-min'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'prodLine', className: 'is-min'},
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

      return {
        _id: model.id,
        className: 'xiconf-entry ' + (model.get('result') === 'success' ? 'success' : 'danger'),
        srcId: model.get('srcId'),
        serviceTag: serviceTag ? ('...' + serviceTag.substr(-4)) : '-',
        order: order ? order.no : '-',
        programName: program ? program.name : (model.get('programName') || '-'),
        programSteps: program ? buildStepLabels(program.steps, model.get('steps')) : '-',
        prodLine: model.get('prodLine') || '-',
        nc12: model.get('nc12') || '-',
        counter: model.get('counter') || '-',
        quantity: order ? order.quantity : '-',
        startedAt: time.format(model.get('startedAt'), 'YY-MM-DD, HH:mm:ss'),
        duration: time.toString(model.get('duration') / 1000, false, true)
      };
    }

  });
});
