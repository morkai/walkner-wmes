// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time'
], function(
  t,
  time
) {
  'use strict';

  return function buildStepLabels(steps, progress)
  {
    return steps
      .map(function(step, i)
      {
        if (step.enabled === false)
        {
          return null;
        }

        var text = step.type;

        if (step.type === 'wait')
        {
          text = step.kind === 'auto' ? time.toString(step.duration) : 'W8';
        }
        else if (t.has('xiconfPrograms', 'step:' + step.type + ':label'))
        {
          text = t('xiconfPrograms', 'step:' + step.type + ':label');
        }

        var className = 'label label-info xiconfPrograms-label xiconfPrograms-label-' + step.type + ' ';

        if (progress && progress[i])
        {
          className += progress[i].status === 'success'
            ? 'is-success'
            : progress[i].status === 'failure'
              ? 'is-failure'
              : 'is-idle';
        }

        return '<span class="' + className + '">' + text + '</span>';
      })
      .filter(function(label) { return label !== null; })
      .join(' ');
  };
});
