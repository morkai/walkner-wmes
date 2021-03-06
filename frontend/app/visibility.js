// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'visibly',
  'app/broker'
], function(
  visibly,
  broker
) {
  'use strict';

  var visibility = {
    visible: !visibly.hidden()
  };

  visibly.onVisible(function()
  {
    visibility.visible = true;

    broker.publish('visibility.visible', visibility);
  });

  visibly.onHidden(function()
  {
    visibility.visible = false;

    broker.publish('visibility.hidden', visibility);
  });

  return visibility;
});
