// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/views/ListView',
  '../util/buildStepLabels'
], function(
  t,
  time,
  ListView,
  buildStepLabels
) {
  'use strict';

  return ListView.extend({

    className: 'xiconfPrograms-list is-clickable',

    columns: [
      {id: 'name', className: 'is-min'},
      {id: 'prodLines', className: 'is-min'},
      {id: 'programType', label: t.bound('xiconfPrograms', 'PROPERTY:type'), className: 'is-min'},
      'steps',
      {id: 'updatedAt', className: 'is-min'}
    ],

    serializeRow: function(model)
    {
      var obj = model.serialize();

      obj.steps = buildStepLabels(obj.steps);

      return obj;
    }

  });
});
