// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/wmes-osh-common/Entry'
], function(
  t,
  currentUser,
  Entry
) {
  'use strict';

  const KOM_ICONS = {
    0: '',
    1: 'fa-star',
    2: 'fa-trophy'
  };

  const Kaizen = Entry.extend({

    urlRoot: '/osh/kaizens',

    clientUrlRoot: '#osh/kaizens',

    topicPrefix: 'osh.kaizens',

    privilegePrefix: 'OSH:KAIZENS',

    nlsDomain: 'wmes-osh-kaizens',

    getModelType: function()
    {
      return 'kaizen';
    },

    getAttachmentKinds: function()
    {
      return ['before', 'after', 'other'];
    },

    serialize: function()
    {
      const obj = Entry.prototype.serialize.apply(this, arguments);

      obj.komIcon = KOM_ICONS[obj.kom];
      obj.reward = (Math.round(obj.reward * 100) / 100).toLocaleString('pl', {style: 'currency', currency: 'PLN'});

      return obj;
    },

    serializeRow: function()
    {
      const obj = Entry.prototype.serializeRow.apply(this, arguments);

      if (obj.komIcon)
      {
        obj.status += ` <i class="fa ${obj.komIcon}" title="${t(this.nlsDomain, `kom:${obj.kom}`)}"></i>`;
      }

      return obj;
    }

  }, {

    RID_PREFIX: 'K',
    TIME_PROPS: ['createdAt', 'startedAt', 'implementedAt', 'finishedAt'],
    USER_PROPS: ['creator', 'implementers', 'coordinators'],
    DICT_PROPS: [
      'division', 'workplace', 'department', 'building', 'location', 'station',
      'kind', 'kaizenCategory'
    ],
    DESC_PROPS: ['kind', 'kaizenCategory'],
    KOM_ICONS

  });

  Kaizen.can = Object.assign({}, Kaizen.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:KAIZENS:MANAGE');
    }

  });

  return Kaizen;
});
