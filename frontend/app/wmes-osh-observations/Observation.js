// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/user',
  'app/time',
  'app/wmes-osh-common/Entry'
], function(
  require,
  t,
  currentUser,
  time,
  Entry
) {
  'use strict';

  const Observation = Entry.extend({

    urlRoot: '/osh/observations',

    clientUrlRoot: '#osh/observations',

    topicPrefix: 'osh.observations',

    privilegePrefix: 'OSH:ACTIONS',

    nlsDomain: 'wmes-osh-observations',

    getModelType: function()
    {
      return 'observation';
    },

    serialize: function()
    {
      const obj = Entry.prototype.serialize.apply(this, arguments);

      obj.company = obj.companyName;

      return obj;
    },

    serializeRow: function()
    {
      const obj = Entry.prototype.serializeRow.apply(this, arguments);

      obj.date = time.utc.format(obj.date, 'L, H');

      return obj;
    },

    serializeDetails: function()
    {
      const obj = Entry.prototype.serializeDetails.apply(this, arguments);

      obj.date = time.utc.format(obj.date, t(this.nlsDomain, 'details:date:format'));

      return obj;
    }

  }, {

    RID_PREFIX: 'O',
    TIME_PROPS: ['createdAt', 'finishedAt'],
    USER_PROPS: ['creator', 'coordinators'],
    DICT_PROPS: [
      'company',
      'observationKind',
      'workplace', 'division', 'building', 'location', 'station'
    ],
    DESC_PROPS: ['observationKind']

  });

  Observation.can = Object.assign({}, Observation.can, {

    manage: function()
    {
      return currentUser.isAllowedTo('OSH:OBSERVATIONS:MANAGE');
    },

    add: function()
    {
      return (this.can || this).manage() || currentUser.isAllowedTo('OSH:OBSERVER', 'OSH:COORDINATOR');
    },

    edit: function(model)
    {
      if ((this.can || this).manage())
      {
        return true;
      }

      if (model.isCoordinator())
      {
        return true;
      }

      if (model.isCreator())
      {
        return model.get('status') === 'inProgress'
          || (Date.now() - Date.parse(model.get('createdAt'))) < 3600000;
      }

      return false;
    },

    assign: function()
    {
      return currentUser.isLoggedIn();
    },

    assignFinished: function(model)
    {
      if ((this.can || this).manage())
      {
        return true;
      }

      if (model.isCoordinator())
      {
        return true;
      }

      return false;
    }

  });

  return Observation;
});
