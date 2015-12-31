// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../time',
  '../updater/index',
  '../core/Model'
], function(
  user,
  time,
  updater,
  Model
) {
  'use strict';

  var win = window;

  return Model.extend({

    urlRoot: '/feedback',

    clientUrlRoot: '#feedback',

    topicPrefix: 'feedback',

    privilegePrefix: 'FEEDBACK',

    nlsDomain: 'feedback',

    defaults: function()
    {
      return {
        project: null,
        savedAt: null,
        createdAt: null,
        creator: user.data._id,
        reporter: user.data._id,
        owner: null,
        page: {
          title: win.document.title,
          url: win.location.href
        },
        versions: updater.versions,
        navigator: {
          userAgent: win.navigator.userAgent,
          userLanguage: win.navigator.userLanguage,
          platform: win.navigator.platform,
          width: win.screen.width,
          height: win.screen.height,
          innerWidth: win.innerWidth,
          innerHeight: win.innerHeight
        },
        summary: '',
        comment: '',
        type: 'other',
        priority: null,
        status: null,
        resolution: null,
        expectedAt: null,
        pariticipants: [],
        watchers: [],
        replies: []
      };
    }

  });
});
