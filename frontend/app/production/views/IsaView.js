// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/isaPalletKinds',
  'app/production/templates/isa'
], function(
  _,
  t,
  viewport,
  View,
  isaPalletKinds,
  template
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
        var requestType = this.model.isaLineState.get('requestType');

        if (requestType === 'pickup')
        {
          this.cancel();
        }
        else if (requestType === null)
        {
          this.pickup();
        }
      },
      'click #-deliver': function()
      {
        var requestType = this.model.isaLineState.get('requestType');

        if (requestType === 'delivery')
        {
          this.cancel();
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

      var lineState = view.model.isaLineState;
      var render = _.debounce(function()
      {
        if (view.rendered)
        {
          view.render();
        }
      }, 1);

      view.listenTo(lineState, 'request', function()
      {
        view.syncing = true;
        render();
      });
      view.listenTo(lineState, 'error sync', function()
      {
        view.syncing = false;
        render();
      });
      view.listenTo(lineState, 'change', render);
    },

    serialize: function()
    {
      if (!this.model.isaLineState.get('status'))
      {
        return {
          idPrefix: this.idPrefix,
          palletKinds: [],
          requestIndicatorColor: 'grey',
          responseIndicatorColor: 'grey',
          pickupActive: false,
          pickupDisabled: true,
          deliveryActive: false,
          deliveryDisabled: true,
          selectedPalletKind: null,
          dropdownEnabled: false
        };
      }

      var syncing = this.syncing;
      var connected = this.socket.isConnected();
      var locked = this.model.isLocked();
      var lineState = this.model.isaLineState.serialize();
      var pickupActive = lineState.requestType === 'pickup';
      var deliveryActive = lineState.requestType === 'delivery';
      var request = lineState.status === 'request';
      var response = lineState.status === 'response';
      var idle = !request && !response;

      return {
        idPrefix: this.idPrefix,
        palletKinds: isaPalletKinds.toJSON(),
        requestIndicatorColor: !locked && connected && !idle ? 'orange' : 'grey',
        responseIndicatorColor: !locked && connected && response ? 'green' : 'grey',
        pickupActive: pickupActive,
        pickupDisabled: locked || syncing || !connected || response || deliveryActive,
        deliveryActive: deliveryActive,
        deliveryDisabled: locked || syncing || !connected || response || pickupActive,
        selectedPalletKind: lineState.palletKind,
        dropdownEnabled: _.isEmpty(lineState.palletKind)
      };
    },

    afterRender: function()
    {
      this.rendered = true;
    },

    cancel: function()
    {
      this.model.isaLineState.cancel(this.model.getSecretKey(), this.showErrorMessage.bind(this, 'cancel'));
    },

    pickup: function()
    {
      this.model.isaLineState.pickup(this.model.getSecretKey(), this.showErrorMessage.bind(this, 'pickup'));
    },

    deliver: function(palletKind)
    {
      this.model.isaLineState.deliver(
        palletKind,
        this.model.getSecretKey(),
        this.showErrorMessage.bind(this, 'deliver')
      );
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
