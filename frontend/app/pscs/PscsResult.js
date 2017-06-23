// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  t,
  time,
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/pscs/results',

    clientUrlRoot: '#pscs/results',

    topicPrefix: 'pscs.results',

    privilegePrefix: 'PSCS',

    nlsDomain: 'pscs',

    labelAttribute: 'rid',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = obj.status === 'failed' ? 'danger' : obj.status === 'passed' ? 'success' : '';
      obj.status = t('pscs', 'status:' + obj.status);
      obj.user = renderUserInfo({userInfo: obj.user});
      obj.creator = renderUserInfo({userInfo: obj.creator});
      obj.startedAt = time.format(obj.startedAt, 'LLLL');
      obj.duration = time.toString(obj.duration / 1000);

      obj.answers.forEach(function(answer, i)
      {
        obj['a' + (i + 1)] = answer + ' <i class="fa fa-thumbs-' + (obj.validity[i] ? 'up' : 'down') + '"></i>';
      });

      return obj;
    }

  });
});
