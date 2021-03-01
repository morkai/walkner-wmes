// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/wmes-osh-common/Entry'
], function(
  currentUser,
  Entry
) {
  'use strict';

  const Accident = Entry.extend({

    urlRoot: '/osh/accidents',

    clientUrlRoot: '#osh/accidents',

    topicPrefix: 'osh.accidents',

    privilegePrefix: 'OSH:ACCIDENTS',

    nlsDomain: 'wmes-osh-accidents',

    getModelType: function()
    {
      return 'accident';
    },

    getAttachmentKinds: function()
    {
      return ['other'];
    }

  }, {

    RID_PREFIX: 'W',
    TIME_PROPS: ['createdAt', 'eventDate'],
    USER_PROPS: ['creator', 'coordinators'],
    DICT_PROPS: [
      'division', 'workplace', 'department', 'building', 'location', 'station'
    ],
    DESC_PROPS: []

  });

  Accident.STATUS_TO_CLASS = {
    finished: 'default'
  };

  Accident.can = Object.assign({}, Accident.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:ACCIDENTS:MANAGE');
    },

    delete: function(model)
    {
      if ((this.can || this).manage())
      {
        return true;
      }

      return model.isCreator()
        && (Date.now() - Date.parse(model.get('createdAt'))) < 3600000;
    }

  });

  return Accident;
});
