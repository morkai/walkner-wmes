// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/user',
  'app/wmes-osh-common/Entry'
], function(
  require,
  currentUser,
  Entry
) {
  'use strict';

  const Action = Entry.extend({

    urlRoot: '/osh/actions',

    clientUrlRoot: '#osh/actions',

    topicPrefix: 'osh.actions',

    privilegePrefix: 'OSH:ACTIONS',

    nlsDomain: 'wmes-osh-actions',

    getModelType: function()
    {
      return 'action';
    }

  }, {

    RID_PREFIX: 'A',
    TIME_PROPS: ['createdAt', 'startedAt', 'implementedAt', 'finishedAt'],
    USER_PROPS: ['creator', 'implementers', 'coordinators', 'participants'],
    DICT_PROPS: [
      'workplace', 'division', 'building', 'location', 'station',
      'kind', 'activityKind'
    ],
    DESC_PROPS: ['kind', 'activityKind']

  });

  Action.can = Object.assign({}, Action.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:ACTIONS:MANAGE');
    },

    add: function()
    {
      return (this.can || this).manage() || require('app/wmes-osh-common/dictionaries').isCoordinator();
    }

  });

  return Action;
});
