// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/wmes-osh-common/Entry'
], function(
  currentUser,
  Entry
) {
  'use strict';

  const Kaizen = Entry.extend({

    urlRoot: '/osh/kaizens',

    clientUrlRoot: '#osh/kaizens',

    topicPrefix: 'osh.kaizens',

    privilegePrefix: 'OSH:KAIZENS',

    nlsDomain: 'wmes-osh-kaizens',

    getModelType: function()
    {
      return 'kaizen';
    }

  }, {

    RID_PREFIX: 'K',
    TIME_PROPS: ['createdAt', 'startedAt', 'implementedAt', 'finishedAt'],
    USER_PROPS: ['creator', 'implementers', 'coordinators'],
    DICT_PROPS: [
      'workplace', 'division', 'building', 'location', 'station',
      'kind', 'eventCategory'
    ],
    DESC_PROPS: ['kind', 'eventCategory']

  });

  Kaizen.can = Object.assign({}, Kaizen.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:KAIZENS:MANAGE');
    }

  });

  return Kaizen;
});
