// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wh/templates/messages/noAction',
  'app/wh/templates/messages/resolvingAction',
  'app/wh/templates/messages/text',
  'app/wh/templates/messages/userNotFound',
  'app/wh/templates/messages/switchingPlan'
], function(
  noAction,
  resolvingAction,
  text,
  userNotFound,
  switchingPlan
) {
  'use strict';

  return {
    noAction: noAction,
    resolvingAction: resolvingAction,
    text: text,
    userNotFound: userNotFound,
    switchingPlan: switchingPlan
  };
});
