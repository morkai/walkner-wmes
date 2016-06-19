// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/isaPalletKinds',
  'app/production/templates/isa',
  'app/production/templates/isaCancelDialog'
], function(
  _,
  t,
  viewport,
  View,
  DialogView,
  isaPalletKinds,
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

        if (!deliveryRequest)
        {
          return;
        }

        if (deliveryRequest.get('status') === 'new')
        {
          this.cancel(deliveryRequest);
        }
      },
      'click a[data-pallet-kind]': function(e)
      {
        this.deliver(e.currentTarget.dataset.palletKind);
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

    serialize: function()
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
      var selectedPalletKind = deliveryRequest ? deliveryRequest.getFullPalletKind() : null;

      return {
        idPrefix: this.idPrefix,
        palletKinds: isaPalletKinds.toJSON(),
        pickupIndicatorColor: this.serializeIndicatorColor(pickupRequest),
        deliveryIndicatorColor: this.serializeIndicatorColor(deliveryRequest),
        pickupActive: pickupActive,
        pickupDisabled: !this.rendered || locked || syncing || !connected || pickupAccepted,
        deliveryActive: deliveryActive,
        deliveryDisabled: !this.rendered || locked || syncing || !connected || deliveryAccepted,
        selectedPalletKind: selectedPalletKind,
        dropdownEnabled: _.isEmpty(selectedPalletKind)
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

    afterRender: function()
    {
      this.rendered = true;
    },

    pickup: function()
    {
      this.model.isaRequests.pickup(this.model.getSecretKey(), this.showErrorMessage.bind(this, 'pickup'));
    },

    deliver: function(palletKind)
    {
      this.model.isaRequests.deliver(
        palletKind,
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
        model: {
          requestType: request.get('type')
        }
      });

      view.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          view.model.isaRequests.cancel(
            request.id,
            view.model.getSecretKey(),
            view.showErrorMessage.bind(view, 'cancel')
          );
        }
      });

      viewport.showDialog(dialogView, t('production', 'isa:cancel:title'));
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
