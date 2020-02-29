// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/data/downtimeReasons'
], function(
  t,
  time,
  Model,
  userInfoTemplate,
  downtimeReasons
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/downtimes',

    clientUrlRoot: '#wh/downtimes',

    topicPrefix: 'old.wh.downtimes',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-downtimes',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.startedAt = time.format(obj.startedAt, 'LLL');
      obj.duration = time.toString(obj.duration / 1000, false, false);

      var reason = downtimeReasons.get(obj.reason);

      if (reason)
      {
        obj.reason = reason.getLabel();
      }

      obj.user = userInfoTemplate({userInfo: obj.user});

      return obj;
    }

  });
});
