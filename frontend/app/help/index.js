// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/broker',
  'app/socket',
  'app/viewport',
  'i18n!app/nls/help'
], function(
  $,
  t,
  broker,
  socket,
  viewport
) {
  'use strict';

  var F11 = 112;
  var $message = null;

  function onKeyDown(e)
  {
    if (e.keyCode === F11)
    {
      e.preventDefault();
    }
  }

  function onKeyUp(e)
  {
    if (e.keyCode === F11)
    {
      handleKeyPress(e.ctrlKey);
    }
  }

  function handleKeyPress(ctrlKey)
  {
    /* jshint unused:false */

    if (!socket.isConnected())
    {
      return showMessage('error', 3000, 'offline');
    }

    var helpId = viewport.currentPage.helpId;

    if (typeof helpId !== 'string' || !helpId.length)
    {
      return showMessage('warning', 3000, 'undefined');
    }

    viewport.msg.loading();

    setTimeout(viewport.msg.loaded.bind(viewport.msg), 1337);

    var fileId = '1l2oUipcGJbpv_3elaZgtVh8gnb2EeRuK-pUYCoUdGg8';

    broker.publish('router.navigate', {
      url: '/help/' + helpId,
      trigger: true,
      replace: false
    });
  }

  function showMessage(type, time, key)
  {
    hideMessage();

    $message = viewport.msg.show({
      type: type,
      time: time,
      text: t('help', 'msg:' + key)
    });
  }

  function hideMessage()
  {
    if ($message)
    {
      viewport.msg.hide($message, true);
      $message = null;
    }
  }

  return {
    enable: function()
    {
      $(window)
        .on('keydown.helpManager', onKeyDown)
        .on('keyup.helpManager', onKeyUp);
    },
    disable: function()
    {
      $(window).off('.helpManager');
    }
  };
});
