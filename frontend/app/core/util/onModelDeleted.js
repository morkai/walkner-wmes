// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport'
], function(
  t,
  viewport
) {
  'use strict';

  return function onModelDeleted(broker, localModel, message, skipCheck)
  {
    var remoteModel = message ? message.model : null;

    if (!skipCheck && (!remoteModel || remoteModel._id !== localModel.id))
    {
      return;
    }

    broker.subscribe('router.executing').setLimit(1).on('message', function()
    {
      viewport.msg.show({
        type: 'warning',
        time: 5000,
        text: t(localModel.getNlsDomain() || 'core', 'MSG:DELETED', {
          label: localModel.getLabel()
        })
      });
    });

    broker.publish('router.navigate', {
      url: localModel.genClientUrl('base'),
      trigger: true,
      replace: true
    });
  };
});
