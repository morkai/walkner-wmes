// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  './util/decorateLogEntry'
], function(
  t,
  time,
  Model,
  decorateLogEntry
) {
  'use strict';

  return Model.extend({

    urlRoot: '/icpo/results',

    clientUrlRoot: '#icpo/results',

    privilegePrefix: 'ICPO',

    nlsDomain: 'icpo',

    getDecoratedLog: function()
    {
      var log = this.get('log');

      return Array.isArray(log) ? log.map(decorateLogEntry) : [];
    },

    hasData: function(type)
    {
      var data = this.get(type + 'Data');

      return typeof data === 'string' && data.length !== 0;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      var startedAt = Date.parse(obj.startedAt);
      var finishedAt = Date.parse(obj.finishedAt);

      obj.duration = time.toString((finishedAt - startedAt) / 1000, false, true);
      obj.startedAt = time.format(startedAt, 'LL, LTS');
      obj.finishedAt = time.format(finishedAt, 'LL, LTS');
      obj.errorCode = obj.errorCode ? t('icpo', 'error:' + obj.errorCode) : '-';
      obj.log = this.getDecoratedLog();

      return obj;
    }

  });
});
