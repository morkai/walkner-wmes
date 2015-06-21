// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/core/views/ListView'
], function(
  t,
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'xiconfPrograms-list is-clickable',

    columns: [
      {id: 'name', className: 'is-min'},
      {id: 'programType', label: t.bound('xiconfPrograms', 'PROPERTY:type'), className: 'is-min'},
      'steps',
      {id: 'updatedAt', className: 'is-min'}
    ],

    serializeRow: function(model)
    {
      var obj = model.serialize();

      obj.steps = obj.steps
        .filter(function(step) { return step.enabled; })
        .map(function(step)
        {
          var label = step.type;

          if (step.type === 'wait')
          {
            label = step.kind === 'auto' ? time.toString(step.duration) : 'W8';
          }
          else if (t.has('xiconfPrograms', 'step:' + step.type + ':label'))
          {
            label = t('xiconfPrograms', 'step:' + step.type + ':label');
          }

          return '<span class="label label-info label-' + step.type + '">' + label + '</span>';
        })
        .join(' ');

      return obj;
    }

  });
});
