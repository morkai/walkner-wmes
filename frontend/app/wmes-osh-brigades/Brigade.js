// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/dictionaries'
], function(
  t,
  time,
  currentUser,
  Model,
  userInfoTemplate,
  dictionaries
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/brigades',

    clientUrlRoot: '#osh/brigades',

    topicPrefix: 'osh.brigades',

    privilegePrefix: 'OSH:HR',

    nlsDomain: 'wmes-osh-brigades',

    getLabel: function()
    {
      return time.utc.format(this.get('date'), 'YYYY-MM') + ', ' + this.get('leader').label;
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.date = time.utc.format(obj.date, 'MMMM YYYY');
      obj.shift = t(this.nlsDomain, `shift:${obj.shift}`);
      obj.leader = userInfoTemplate(obj.leader);

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();
      const leader = this.get('leader');
      const members = obj.members;

      obj.members = members.length ? userInfoTemplate(obj.members[0]) : '';

      if (members.length > 1)
      {
        obj.members += ` +${members.length - 1}`;
      }

      obj.division = dictionaries.divisions.getLabel(leader.oshDivision, {short: true});
      obj.workplace = dictionaries.workplaces.getLabel(leader.oshWorkplace, {short: true});
      obj.department = dictionaries.departments.getLabel(leader.oshDepartment, {short: true});

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();
      const leader = this.get('leader');

      obj.members = obj.members.map(userInfoTemplate);

      obj.division = dictionaries.divisions.getLabel(leader.oshDivision);
      obj.workplace = dictionaries.workplaces.getLabel(leader.oshWorkplace);
      obj.department = dictionaries.departments.getLabel(leader.oshDepartment);

      return obj;
    }

  }, {

    can: {

      add: function()
      {
        return currentUser.isAllowedTo('OSH:HR:MANAGE', 'OSH:LEADER');
      },

      edit: function(model)
      {
        if (currentUser.isAllowedTo('OSH:HR:MANAGE'))
        {
          return true;
        }

        if (model.get('leader').id === currentUser.data._id)
        {
          return true;
        }

        return false;
      }

    }

  });
});
