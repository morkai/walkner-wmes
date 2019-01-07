// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n'
],
function(
  $,
  t
) {
  'use strict';

  var N = window.Notification;

  return window.notifications = {

    renderRequest: function()
    {
      // TODO remove
      if (window.ENV === 'production')
      {
        return;
      }

      if (!N || N.permission === 'granted' || N.permission === 'denied')
      {
        return;
      }

      var $request = $('<div class="message message-inline message-warning notifications-request"></div>')
        .append('<p>' + t('core', 'notifications:request:message') + '</p>');

      $request.on('click', function()
      {
        if (N.permission !== 'default')
        {
          $request.remove();

          return;
        }

        N.requestPermission().then(function(permission)
        {
          if (permission === 'granted')
          {
            window.location.reload();
          }
          else if (permission !== 'default')
          {
            $request.remove();
          }
        });
      });

      $('.bd').prepend($request);
    },

    show: function(options)
    {
      return N && N.permission === 'granted' ? new N(options.title, options) : null;
    }

  };
});
