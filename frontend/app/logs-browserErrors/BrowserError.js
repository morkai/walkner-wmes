// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  function parseStack(line)
  {
    var matches = line.match(/^(.*?)(?: \()?(https?:\/\/.*?)(\/.*?):([0-9]+):([0-9]+)/);

    if (!matches)
    {
      return {
        stack: line,
        fn: line,
        host: '',
        file: '',
        line: '',
        col: ''
      };
    }

    return {
      stack: line,
      fn: matches[1],
      host: matches[2],
      file: matches[3],
      line: +matches[4],
      col: +matches[5]
    };
  }

  return Model.extend({

    urlRoot: '/logs/browserErrors',

    clientUrlRoot: '#logs/browserErrors',

    topicPrefix: 'logs.browserErrors',

    privilegePrefix: 'LOGS',

    nlsDomain: 'logs-browserErrors',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.time = time.format(obj.time, 'L, HH:mm:ss');
      obj.user = userInfoTemplate({userInfo: obj.user});
      obj.stack = obj.error.stack.map(parseStack);
      obj.source = obj.stack.length ? obj.stack[0].file : '';
      obj.location = obj.browser.location.match(/[a-z0-9](\/.*?)$/)[1];
      obj.error = obj.error.message;
      obj.appId = obj.headers['x-wmes-app'];

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.className = obj.resolved ? 'success' : '';
      obj.location = '<span class="logs-list-location">' + _.escape(obj.location) + '</span>';
      obj.error = '<span class="logs-list-error">' + _.escape(obj.error) + '</span>';

      return obj;
    },

    serializeDetails: function()
    {
      return this.toJSON();
    }

  }, {

    parseStack: parseStack

  });
});
