// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/updater/templates/addressUpdate'
], function(
  user,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'updater-addressUpdate-dialog',

    events: {

      'click #-go': function()
      {
        if (user.isLoggedIn())
        {
          window.location.href = '/addressUpdate/redirect?hash=' + encodeURIComponent(window.location.hash || '#');
        }
        else
        {
          window.location.href = 'https://ket.wmes.pl/' + window.location.hash;
        }
      }

    },

    getTemplateData: function()
    {
      return {
        oldAddress: window.location.origin,
        newAddress: 'https://ket.wmes.pl'
      };
    },

    afterRender: function()
    {
      window.sessionStorage.setItem('WMES_ADDRESS_UPDATE', '1');
    }

  });
});
