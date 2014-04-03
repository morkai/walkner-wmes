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
      trigger: true
    });
  };
});
