// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/orders/templates/eto'
], function(
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: {
      'orderDocuments.eto.synced': function(message)
      {
        if (message.nc12 === this.model.get('nc12'))
        {
          this.tryLoadDocument();
        }
      }
    },

    events: {
      'click #-external': function()
      {
        window.open(this.$('iframe').prop('src'), 'ETO_' + this.model.id);
      },
      'click #-toggle': function()
      {
        var $iframe = this.$('iframe');

        if (!$iframe.length)
        {
          return;
        }

        var expanded = !!$iframe.data('expanded');
        var bodyEl = $iframe[0].contentWindow.document.body;
        var height = bodyEl.parentNode.getClientRects()[0].height;

        bodyEl.style.overflowY = 'scroll';

        if (expanded)
        {
          height = 250;
        }

        $iframe
          .stop(true, false)
          .animate({height: height})
          .data('expanded', !expanded);

        this.$id('toggle').find('.fa')
          .removeClass('fa-chevron-up fa-chevron-down')
          .addClass('fa-chevron-' + (expanded ? 'down' : 'up'));
      }
    },

    afterRender: function()
    {
      this.tryLoadDocument();
    },

    tryLoadDocument: function()
    {
      var view = this;
      var url = '/orderDocuments/ETO?order=' + view.model.id + '&header=0';

      if (this.$el.hasClass('orders-eto-loaded'))
      {
        this.$('iframe')[0].contentWindow.location.reload();

        return;
      }

      view.ajax({method: 'HEAD', url: url})
        .fail(function(xhr)
        {
          if (xhr.status >= 500)
          {
            view.$el
              .removeClass('panel-default')
              .addClass('panel-danger')
              .find('.fa-spin')
              .removeClass('fa-spin');
          }
          else
          {
            view.$('.panel-body').text(view.t('ETO:NO_DATA'));
            view.$el.addClass('hidden');
            view.model.trigger('panelToggle');
          }
        })
        .done(function()
        {
          view.loadDocument(url);
        });
    },

    loadDocument: function(url)
    {
      var $iframe = $('<iframe></iframe>').prop('src', url);

      this.$el.addClass('orders-eto-loaded');
      this.$('.panel-body').empty().append($iframe);
      this.$el.removeClass('hidden');

      this.model.trigger('panelToggle');
    }

  });
});
