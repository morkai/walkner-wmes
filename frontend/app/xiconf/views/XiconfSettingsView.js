// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/xiconf/templates/settings'
], function(
  _,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#xiconf;settings',

    template: template,

    events: _.extend({

    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.call(this);
    },

    updateSettingField: function(setting)
    {

    }

  });
});
