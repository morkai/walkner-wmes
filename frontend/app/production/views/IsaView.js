// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/isaPalletKinds',
  './IsaPalletDeliveryDialogView',
  'app/production/templates/isa',
  'app/production/templates/isaCancelDialog'
], function(
  _,
  t,
  viewport,
  View,
  DialogView,
  isaPalletKinds,
  IsaPalletDeliveryDialogView,
  template,
  cancelDialogTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    localTopics: {
      'socket.disconnected': 'render',
      'isaPalletKinds.synced': 'render'
    },

    events: {
      'click #-pickup': function()
      {
        var pickupRequest = this.model.isaRequests.getFirstPickup();

        if (!pickupRequest)
        {
          return this.pickup();
        }

        if (pickupRequest.get('status') === 'new')
        {
          this.cancel(pickupRequest);
        }
      },
      'click #-deliver': function()
      {
        var deliveryRequest = this.model.isaRequests.getFirstDelivery();

        if (deliveryRequest)
        {
          if (deliveryRequest.get('status') === 'new')
          {
            this.cancel(deliveryRequest);
          }

          return;
        }

        var dialogView = new IsaPalletDeliveryDialogView({
          embedded: this.options.embedded,
          vkb: this.options.vkb
        });

        this.listenTo(dialogView, 'picked', function(palletKind, count)
        {
          dialogView.closeDialog();

          this.deliver(palletKind, count);
        });

        viewport.showDialog(dialogView, this.t('isa:deliver:title'));
      }
    },

    initialize: function()
    {
      var view = this;

      view.syncing = false;
      view.rendered = false;

      var isaRequests = view.model.isaRequests;
      var render = _.debounce(function()
      {
        if (view.rendered)
        {
          view.render();
        }
      }, 1);

      view.listenTo(isaRequests, 'request', function()
      {
        view.syncing = true;
        render();
      });
      view.listenTo(isaRequests, 'error sync', function()
      {
        view.syncing = false;
        render();
      });
      view.listenTo(isaRequests, 'add remove change reset', render);
    },

    getTemplateData: function()
    {
      var syncing = this.syncing;
      var connected = this.socket.isConnected();
      var locked = this.model.isLocked();
      var pickupRequest = this.model.isaRequests.getFirstPickup();
      var deliveryRequest = this.model.isaRequests.getFirstDelivery();
      var pickupActive = !!pickupRequest;
      var deliveryActive = !!deliveryRequest;
      var pickupAccepted = pickupRequest ? (pickupRequest.get('status') === 'accepted') : false;
      var deliveryAccepted = deliveryRequest ? (deliveryRequest.get('status') === 'accepted') : false;
      var selectedQty = deliveryRequest ? deliveryRequest.getQty() : 0;
      var selectedPalletKind = deliveryRequest ? deliveryRequest.getFullPalletKind() : null;

      return {
        pickupIndicatorColor: this.serializeIndicatorColor(pickupRequest),
        deliveryIndicatorColor: this.serializeIndicatorColor(deliveryRequest),
        pickupStatusLabel: this.serializeStatusLabel(pickupRequest),
        pickupActive: pickupActive,
        pickupDisabled: !this.rendered || locked || syncing || !connected || pickupAccepted,
        deliveryStatusLabel: this.serializeStatusLabel(deliveryRequest),
        deliveryActive: deliveryActive,
        deliveryDisabled: !this.rendered || locked || syncing || !connected || deliveryAccepted,
        selectedQty: selectedQty,
        selectedPalletKind: selectedPalletKind
      };
    },

    serializeIndicatorColor: function(request)
    {
      if (!request || this.model.isLocked())
      {
        return 'grey';
      }

      switch (request.get('status'))
      {
        case 'new':
          return 'orange';

        case 'accepted':
          return 'green';

        default:
          return 'grey';
      }
    },

    serializeStatusLabel: function(request)
    {
      return this.t('isa:status:' + (request ? request.get('status') : 'idle'));
    },

    afterRender: function()
    {
      this.rendered = true;
    },

    pickup: function()
    {
      this.model.isaRequests.pickup(this.model.getSecretKey(), this.showErrorMessage.bind(this, 'pickup'));
    },

    deliver: function(palletKind, qty)
    {
      this.model.isaRequests.deliver(
        palletKind,
        qty,
        this.model.getSecretKey(),
        this.showErrorMessage.bind(this, 'deliver')
      );
    },

    cancel: function(request)
    {
      var view = this;
      var dialogView = new DialogView({
        dialogClassName: 'production-modal',
        template: cancelDialogTemplate,
        nlsDomain: this.model.getNlsDomain(),
        model: {
          requestType: request.get('type')
        }
      });

      view.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes' && view.model.isaRequests.get(request.id))
        {
          view.model.isaRequests.cancel(
            request.id,
            view.model.getSecretKey(),
            view.showErrorMessage.bind(view, 'cancel')
          );
        }
      });

      viewport.showDialog(dialogView, view.t('isa:cancel:title'));
    },

    showErrorMessage: function(action, err)
    {
      if (!err)
      {
        return;
      }

      viewport.msg.show({
        type: 'error',
        time: 5000,
        text: t.has('isa', action + ':' + err.message)
          ? t('isa', action + ':' + err.message)
          : t('isa', action + ':failure')
      });
    }

  });
});
