// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/i18n',
  'app/viewport',
  'app/core/util/pageActions',
  './isChangeRequest'
], function(
  _,
  broker,
  t,
  viewport,
  pageActions,
  isChangeRequest
) {
  'use strict';

  return function(page, model)
  {
    var nlsDomain = model.getNlsDomain();
    var changeRequest = isChangeRequest();

    if (changeRequest)
    {
      page.broker.subscribe('viewport.dialog.shown')
        .setLimit(1)
        .setFilter(function(dialogView)
        {
          return dialogView.options.actionKey === 'delete' && dialogView.model === model;
        })
        .on('message', function(dialogView)
        {
          page.listenToOnce(dialogView, 'success', function()
          {
            viewport.msg.show({
              type: 'success',
              time: 3000,
              text: t(nlsDomain, 'changeRequest:msg:success:delete')
            });
          });
        });
    }

    return pageActions.delete(model, false, !changeRequest ? {} : {
      formActionText: t.bound(nlsDomain, 'changeRequest:delete:formActionText'),
      messageText: t.bound(nlsDomain, 'changeRequest:delete:messageText'),
      failureText: t.bound(nlsDomain, 'changeRequest:msg:failure:delete')
    });
  };
});
