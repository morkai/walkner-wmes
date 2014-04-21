// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../ProdDowntime',
  '../views/CorroborateProdDowntimeView'
], function(
  t,
  viewport,
  bindLoadingMessage,
  View,
  ProdDowntime,
  CorroborateProdDowntimeView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'corroborateProdDowntime',

    remoteTopics: {
      'prodDowntimes.finished.*': function(message)
      {
        if (this.model.id === message._id)
        {
          this.model.set('finishedAt', new Date(message.finishedAt));
        }
      },
      'prodDowntimes.corroborated.*': function(message)
      {
        if (this.model.id === message._id)
        {
          this.broker.subscribe('router.executing').setLimit(1).on('message', function()
          {
            viewport.msg.show({
              type: 'info',
              time: 2500,
              text: t('prodDowntimes', 'corroborate:msg:corroborated')
            });
          });

          this.broker.publish('router.navigate', {
            url: this.cancelUrl,
            trigger: true,
            replace: true
          });
        }
      }
    },

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodDowntimes', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('prodDowntimes', 'BREADCRUMBS:corroborate')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new ProdDowntime({_id: this.options.modelId}), this);

      this.cancelUrl = this.options.cancelUrl || this.model.genClientUrl();

      this.view = new CorroborateProdDowntimeView({
        cancelUrl: this.cancelUrl,
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch(this.options.fetchOptions));
    }

  });
});
