// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/broker',
  'app/i18n',
  'app/viewport',
  'app/core/util/showDeleteFormPage',
  './isChangeRequest'
], function(
  _,
  broker,
  t,
  viewport,
  showDeleteFormPage,
  isChangeRequest
) {
  'use strict';

  return function(Model)
  {
    var nlsDomain = Model.prototype.nlsDomain;

    return function(req, referer)
    {
      var tmpBroker = broker.sandbox();

      tmpBroker.subscribe('viewport.page.loadingFailed', function() { tmpBroker.destroy(); });

      tmpBroker.subscribe('viewport.page.shown').on('message', function(deleteFormPage)
      {
        tmpBroker.destroy();

        deleteFormPage.listenToOnce(deleteFormPage.view, 'success', function()
        {
          broker.subscribe('router.executing').setLimit(1).on('message', viewport.msg.show.bind(viewport.msg, {
            type: 'success',
            time: 3000,
            text: t(nlsDomain, 'changeRequest:msg:success:delete')
          }));
        });
      });

      return showDeleteFormPage(Model, req, referer, !isChangeRequest() ? {} : {
        formActionText: t.bound(nlsDomain, 'changeRequest:delete:formActionText'),
        messageText: t.bound(nlsDomain, 'changeRequest:delete:messageText'),
        failureText: t.bound(nlsDomain, 'changeRequest:msg:failure:delete')
      });
    };
  };
});
