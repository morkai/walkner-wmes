// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      var nlsDomain = localModel.getNlsDomain();

      viewport.msg.show({
        type: 'warning',
        time: 5000,
        text: t(t.has(nlsDomain, 'MSG:DELETED') ? nlsDomain : 'core', 'MSG:DELETED', {
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
