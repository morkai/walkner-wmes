// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wh/templates/messages/noAction',
  'app/wh/templates/messages/resolvingAction',
  'app/wh/templates/messages/text',
  'app/wh/templates/messages/userNotFound'
], function(
  noAction,
  resolvingAction,
  text,
  userNotFound
) {
  'use strict';

  return {
    noAction: noAction,
    resolvingAction: resolvingAction,
    text: text,
    userNotFound: userNotFound
  };
});
