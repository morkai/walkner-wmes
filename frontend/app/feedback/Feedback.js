// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

  return Model.extend({

    urlRoot: '/feedback',

    clientUrlRoot: '#feedback',

    topicPrefix: 'feedback',

    privilegePrefix: 'FEEDBACK',

    nlsDomain: 'feedback',

    defaults: function()
    {
      return {
        creator: user.getInfo(),
        createdAt: time.getMoment().toDate(),
        savedAt: null,
        page: {
          title: document.title,
          url: location.href
        },
        versions: updater.versions,
        navigator: {
          userAgent: navigator.userAgent,
          userLanguage: navigator.userLanguage,
          platform: navigator.platform,
          width: screen.width,
          height: screen.height,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        },
        comment: ''
      };
    }

  });
});
