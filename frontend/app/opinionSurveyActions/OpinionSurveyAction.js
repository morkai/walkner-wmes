// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  '../opinionSurveys/dictionaries',
  '../opinionSurveys/OpinionSurvey',
  'app/core/templates/userInfo'
], function(
  t,
  time,
  user,
  Model,
  dictionaries,
  OpinionSurvey,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/actions',

    clientUrlRoot: '#opinionSurveyActions',

    topicPrefix: 'opinionSurveys.actions',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyActions',

    labelAttribute: 'rid',

    defaults: {
      status: 'planned'
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(survey)';
    },

    serialize: function(survey)
    {
      var obj = this.toJSON();

      if (!survey)
      {
        survey = new OpinionSurvey(obj.survey && obj.survey._id ? obj.survey : {_id: obj.survey});
      }

      if (!survey.cacheMaps)
      {
        survey.buildCacheMaps();
      }

      var division = dictionaries.divisions.get(obj.division);

      obj.division = division ? division.get('short') : (obj.division || '?');
      obj.survey = survey.get('label') || survey.id;
      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = renderUserInfo({userInfo: obj.creator});
      obj.updatedAt = obj.updatedAt ? time.format(obj.updatedAt, 'LLLL') : '-';
      obj.updater = renderUserInfo({userInfo: obj.updater});
      obj.owners = obj.owners.map(function(owner) { return renderUserInfo({userInfo: owner}); }).join(', ');
      obj.superior = renderUserInfo({userInfo: obj.superior});
      obj.startDate = obj.startDate ? time.format(obj.startDate, 'LL') : '-';
      obj.finishDate = obj.finishDate ? time.format(obj.finishDate, 'LL') : '-';
      obj.status = t('opinionSurveyActions', 'status:' + obj.status);
      obj.question = obj.question || '-';
      obj.problem = obj.problem || '-';
      obj.cause = obj.cause || '-';
      obj.action = obj.action || '-';

      return obj;
    },

    canEdit: function()
    {
      return user.isAllowedTo('OPINION_SURVEYS:MANAGE')
        || this.attributes.participants.indexOf(user.data._id) !== -1;
    },

    canDelete: function()
    {
      return user.isAllowedTo('OPINION_SURVEYS:MANAGE')
        || this.attributes.creator.id === user.data._id;
    }

  });
});
