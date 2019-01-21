// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/updater/templates/browserUpdate'
], function(
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'updater-browserUpdate-dialog',

    events: {

      'click a': function()
      {
        viewport.closeDialog();
      }

    },

    getTemplateData: function()
    {
      var userAgent = window.navigator.userAgent;

      return {
        platform: userAgent.indexOf('Android') !== -1
          ? 'android' : userAgent.indexOf('Mac OS') !== -1
          ? 'mac' : userAgent.indexOf('Linux') !== -1
          ? 'linux' : 'windows'
      };
    },

    afterRender: function()
    {
      var view = this;
      var xhr = view.ajax({
        method: 'HEAD',
        url: 'https://test.wmes.pl/ping'
      });

      xhr.done(function()
      {
        if (xhr.statusCode !== 200)
        {
          return;
        }

        view.$id('downloadUrl').prop(
          'href',
          'https://dl.google.com/tag/s/appguid%3D%7B8A69D345-D564-463C-AFF1-A69D9E530F96%7D%26iid%3D%7BB7F24988-6715-F843-972C-481E05CBA4B5%7D%26lang%3Dpl%26browser%3D4%26usagestats%3D0%26appname%3DGoogle%2520Chrome%26needsadmin%3Dprefers%26ap%3Dx64-stable-statsdef_1%26installdataindex%3Dempty/update2/installers/ChromeSetup.exe'
        );
      });

      window.sessionStorage.setItem('WMES_BROWSER_UPDATE', '1');
    }

  });
});
