// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/data/isaPalletKinds',
  '../IsaRequest',
  '../views/IsaShiftPersonnelView',
  '../views/IsaLineStatesView',
  '../views/IsaEventsView',
  '../views/IsaResponderPickerView',
  'app/isa/templates/page',
  'app/isa/templates/messages/whmanNotFound',
  'app/isa/templates/messages/noAction',
  'app/isa/templates/messages/acceptFailure',
  'app/isa/templates/messages/finishFailure',
  'app/isa/templates/messages/acceptSuccess',
  'app/isa/templates/messages/finishSuccess'
], function(
  _,
  $,
  t,
  viewport,
  View,
  bindLoadingMessage,
  palletKinds,
  IsaRequest,
  IsaShiftPersonnelView,
  IsaLineStatesView,
  IsaEventsView,
  IsaResponderPickerView,
  template,
  whmanNotFoundMessage,
  noActionMessage,
  acceptFailureMessage,
  finishFailureMessage,
  acceptSuccessMessage,
  finishSuccessMessage
) {
  'use strict';

  var KEY_CODES = {
    8: 'Backspace',
    16: 'Shift',
    18: 'Alt',
    32: 'Space',
    70: 'KeyF',
    80: 'KeyP',
    112: 'F1'
  };
  var EVENTS_COLLAPSED_STORAGE_KEY = 'ISA_EVENTS_COLLAPSED';
  var HOTKEYS_VISIBILITY_STORAGE_KEY = 'ISA_HOTKEYS_VISIBILITY';

  return View.extend({

    template: template,

    layoutName: 'page',

    pageId: 'isa',

    title: [
      t.bound('isa', 'BREADCRUMBS:base')
    ],

    actions: [],

    localTopics: {
      'socket.connected': function()
      {
        this.promised(this.warehousemen.fetch({reset: true}));
        this.promised(this.requests.fetch({reset: true}));
        this.promised(this.shiftPersonnel.fetch());

        this.$el.removeClass('isa-is-disconnected');
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('isa-is-disconnected');
      }
    },

    remoteTopics: {
      'isaShiftPersonnel.updated': function(shiftPersonnel)
      {
        this.shiftPersonnel.set(shiftPersonnel);
      },
      'isaRequests.created.**': function(request)
      {
        request = new IsaRequest(IsaRequest.parse(request));

        if (this.pendingChanges)
        {
          this.pendingChanges.push(request);
        }
        else
        {
          this.applyChanges(request);
        }
      },
      'isaRequests.updated.**': function(change)
      {
        change = IsaRequest.parse(change);

        if (this.pendingChanges)
        {
          this.pendingChanges.push(change);
        }
        else
        {
          this.applyChanges(change);
        }
      },
      'isaEvents.saved': function(event)
      {
        this.eventz.unshift(event);

        if (this.eventz.length > 50)
        {
          this.eventz.pop();
        }
      }
    },

    events: {
      'click #-shiftPersonnel': function(e)
      {
        e.currentTarget.blur();

        var dialogView = new IsaShiftPersonnelView({
          model: this.shiftPersonnel
        });

        dialogView.listenToOnce(this.shiftPersonnel, 'sync', viewport.closeDialog.bind(viewport));

        viewport.showDialog(dialogView, t('isa', 'shiftPersonnel:title'));
      },
      'click #-responderFilter': function()
      {
        var $responderFilter = this.$id('responderFilter').removeClass('isa-attract');
        var responderPickerView = new IsaResponderPickerView({
          model: this.model.shiftPersonnel,
          includeSelf: true
        });

        this.listenToOnce(responderPickerView, 'picked', function(user)
        {
          responderPickerView.hide();

          this.model.selectedResponder = user;
          localStorage.ISA_SELECTED_RESPONDER = JSON.stringify(user);

          this.$id('selectedResponder').text(user ? user.label : '');

          this.requests.trigger('filter');
        });

        responderPickerView.show(
          $responderFilter,
          this.model.selectedResponder ? this.model.selectedResponder.id : null
        );
      },
      'click .isa-tab': function(e)
      {
        var $tab = this.$(e.currentTarget);

        if ($tab.hasClass('active'))
        {
          return;
        }

        this.$('.isa-tab.active').removeClass('active');
        $tab.addClass('active');
        this.el.dataset.tab = e.currentTarget.dataset.tab;
      },
      'click .is-collapsed': function(e)
      {
        this.$(e.currentTarget).removeClass('is-collapsed is-collapsing');

        localStorage.removeItem(EVENTS_COLLAPSED_STORAGE_KEY);
      },
      'click #-collapseEvents': 'collapseEvents',
      'click #-toggleFullscreen': 'toggleFullscreen',
      'click #-toggleHotkeys': 'toggleHotkeysVisibility'
    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 30);
      this.onActivity = _.debounce(this.handleInactivity.bind(this), 30000);
      this.pendingChanges = [];
      this.keys = {
        AltLeft: false,
        AltRight: false,
        ShiftLeft: false,
        ShiftRight: false
      };
      this.personnelIdBuffer = '';

      this.timers.updateTime = setInterval(this.updateTimes.bind(this), 15000);

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#' + this.idPrefix + '-requests', this.requestsView);
      this.setView('#' + this.idPrefix + '-responses', this.responsesView);
      this.setView('#' + this.idPrefix + '-events', this.eventsView);
    },

    destroy: function()
    {
      document.body.style.overflow = '';
      document.body.classList.remove('isa-is-fullscreen');
      $(window).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.warehousemen = bindLoadingMessage(this.model.warehousemen, this);
      this.shiftPersonnel = bindLoadingMessage(this.model.shiftPersonnel, this);
      this.requests = bindLoadingMessage(this.model.requests, this);
      this.eventz = bindLoadingMessage(this.model.events, this);

      this.listenTo(this.requests, 'change:status', function(request)
      {
        var oldStatus = request.previous('status');
        var newStatus = request.get('status');

        if (oldStatus === 'new'
          && newStatus === 'accepted'
          && window.innerWidth > 800
          && request.matchResponder(this.model.selectedResponder))
        {
          this.moveRequest(request);
        }
      });
    },

    defineViews: function()
    {
      this.requestsView = new IsaLineStatesView({
        mode: 'requests',
        model: this.model
      });
      this.responsesView = new IsaLineStatesView({
        mode: 'responses',
        model: this.model
      });
      this.eventsView = new IsaEventsView({
        collection: this.eventz
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.requests, 'request', function(model)
      {
        if (model === this.requests && !this.pendingChanges)
        {
          this.pendingChanges = [];
        }
      });
      this.listenTo(this.requests, 'error sync', this.applyPendingChanges);
      this.listenTo(this.requests, 'add', this.requests.sort.bind(this.requests));

      this.listenTo(this.shiftPersonnel, 'change:users', this.attractToShiftPersonnel);

      this.listenTo(this.requestsView, 'recount', this.recount.bind(this, 'requests'));
      this.listenTo(this.responsesView, 'recount', this.recount.bind(this, 'responses'));

      $(window)
        .on('resize.' + this.idPrefix, this.onResize)
        .on('mouseenter.' + this.idPrefix, this.onActivity)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keyup.' + this.idPrefix, this.onKeyUp.bind(this));
    },

    load: function(when)
    {
      this.model.selectedResponder = null;

      return when(
        this.warehousemen.fetch({reset: true}),
        this.shiftPersonnel.fetch(),
        this.requests.fetch({reset: true}),
        this.eventz.fetch({reset: true})
      );
    },

    applyPendingChanges: function()
    {
      if (this.pendingChanges)
      {
        this.pendingChanges.forEach(this.applyChanges, this);
        this.pendingChanges = null;
      }
    },

    applyChanges: function(change)
    {
      if (change instanceof IsaRequest)
      {
        var newRequest = change;
        var oldRequest = this.requests.get(newRequest.id);

        if (!oldRequest)
        {
          this.requests.add(newRequest);
        }
        else if (newRequest.get('updatedAt') > oldRequest.get('updatedAt'))
        {
          oldRequest.set(newRequest.attributes);
        }
      }
      else
      {
        var request = this.requests.get(change._id);

        if (!request)
        {
          return this.scheduleRequestReload();
        }

        if (change.updatedAt > request.get('updatedAt'))
        {
          request.set(change);
        }
      }
    },

    scheduleRequestReload: function()
    {
      clearTimeout(this.timers.reloadRequests);

      this.timers.reloadRequests = setTimeout(
        function(page) { page.promised(page.requests.fetch({reset: true})); }, 1, this
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        height: this.calcHeight(),
        disconnected: !this.socket.isConnected(),
        mobile: /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent),
        selectedResponder: this.model.selectedResponder ? this.model.selectedResponder.label : '',
        eventsCollapsed: !!localStorage[EVENTS_COLLAPSED_STORAGE_KEY],
        hotkeysVisible: !!localStorage[HOTKEYS_VISIBILITY_STORAGE_KEY]
      };
    },

    afterRender: function()
    {
      document.body.style.overflow = 'hidden';

      this.resize();

      if (this.model.shiftPersonnel.isEmpty())
      {
        this.$id('shiftPersonnel').addClass('isa-attract');
      }

      if (this.model.selectedResponder)
      {
        this.$id('responderFilter').addClass('isa-attract');
      }
    },

    attractToShiftPersonnel: function()
    {
      var $shiftPersonnel = this.$id('shiftPersonnel').removeClass('isa-attract');

      if (this.model.shiftPersonnel.isEmpty())
      {
        $shiftPersonnel.addClass('isa-attract');
      }
    },

    resize: function()
    {
      this.$el.height(this.calcHeight());
    },

    calcHeight: function()
    {
      var fullscreen = this.options.fullscreen
        || window.innerWidth <= 800
        || (window.outerWidth === window.screen.width && window.outerHeight === window.screen.height);
      var height = window.innerHeight - 15;

      document.body.classList.toggle('isa-is-fullscreen', fullscreen);

      if (fullscreen)
      {
        height -= 15;

        if (localStorage[HOTKEYS_VISIBILITY_STORAGE_KEY])
        {
          height -= this.$id('hotkeys').outerHeight();
        }
      }
      else
      {
        height -= $('.hd').outerHeight(true) + $('.ft').outerHeight(true);
      }

      return height;
    },

    updateTimes: function()
    {
      this.requests.forEach(function(request)
      {
        request.updateTime(true);
      });

      this.requestsView.updateTimes();
      this.responsesView.updateTimes();
    },

    moveRequest: function(request)
    {
      var page = this;

      page.model.moving[request.id] = true;

      page.requestsView.move(request, function()
      {
        page.responsesView.insert(request, function()
        {
          delete page.model.moving[request.id];
        });
      });
    },

    handleInactivity: function()
    {
      this.$('.isa-section-body').prop('scrollTop', 0);
    },

    recount: function(tab, count)
    {
      this.$id('count-' + tab).text(count || '');
    },

    getKeyCode: function(e)
    {
      var code = e.code;

      if (!code)
      {
        code = KEY_CODES[e.keyCode] || e.keyIdentifier || '';

        switch (e.location)
        {
          case 1:
            code += 'Left';
            break;

          case 2:
            code += 'Right';
            break;
        }
      }

      return code;
    },

    onKeyDown: function(e)
    {
      e = e.originalEvent;

      var code = this.getKeyCode(e);
      var tagName = e.target.tagName;

      if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT')
      {
        if (code === 'Backspace')
        {
          return false;
        }

        if (code === 'Space')
        {
          this.hideMessage();

          return false;
        }

        if (code === 'F1')
        {
          e.preventDefault();

          return;
        }

        if (code === 'Escape' || code === 'Enter')
        {
          this.hideMessage();
        }
      }

      if (typeof this.keys[code] === 'boolean')
      {
        this.keys[code] = true;

        if (code === 'AltRight')
        {
          this.keys.ShiftLeft = false;
          this.$el.removeClass('isa-hotkey-ShiftLeft');
        }

        this.$el.addClass('isa-hotkey-' + code);

        return false;
      }
    },

    onKeyUp: function(e)
    {
      e = e.originalEvent;

      this.onActivity();

      var code = this.getKeyCode(e);

      if (typeof this.keys[code] === 'boolean')
      {
        this.keys[code] = false;

        this.$el.removeClass('isa-hotkey-' + code);

        return false;
      }

      if (code === 'F1')
      {
        this.toggleHotkeysVisibility();

        return;
      }

      if (code === 'KeyP')
      {
        this.$id('shiftPersonnel').click();

        return;
      }

      if (code === 'KeyF')
      {
        this.$id('responderFilter').click();

        return;
      }

      var digit = e.keyCode - 48;

      if (digit < 0 || digit > 9)
      {
        return;
      }

      var view;
      var action;

      if (this.keys.ShiftLeft)
      {
        view = this.requestsView;
        action = 'accept';
      }
      else if (this.keys.AltLeft)
      {
        view = this.responsesView;
        action = 'finish';
      }
      else if (this.keys.AltRight)
      {
        view = this.requestsView;
        action = 'cancel';
      }
      else if (this.keys.ShiftRight)
      {
        view = this.responsesView;
        action = 'cancel';
      }

      if (view && digit !== 0)
      {
        view.actAt(action, digit);

        return false;
      }

      this.personnelIdBuffer += digit.toString();

      this.schedulePersonnelIdCheck();
    },

    schedulePersonnelIdCheck: function()
    {
      if (this.timers.personnelIdCheck)
      {
        clearTimeout(this.timers.personnelIdCheck);
      }

      this.timers.personnelIdCheck = setTimeout(this.checkPersonnelId.bind(this), 200);
    },

    checkPersonnelId: function()
    {
      var personnelId = this.personnelIdBuffer;

      this.personnelIdBuffer = '';

      if (this.timers.hideMessage)
      {
        return;
      }

      var warehouseman = this.findWarehousemanByPersonnelId(personnelId);

      if (!warehouseman)
      {
        if (personnelId.length <= 3)
        {
          return;
        }

        return this.showMessage('error', 5000, whmanNotFoundMessage({
          personnelId: personnelId
        }));
      }

      var response = this.findResponseByResponder(warehouseman);

      if (response)
      {
        return this.finishResponse(response);
      }

      var request = this.findRequest();

      if (request)
      {
        return this.acceptRequest(request, warehouseman);
      }

      this.showMessage('error', 5000, noActionMessage({
        whman: warehouseman.getLabel()
      }));
    },

    findWarehousemanByPersonnelId: function(personnelId)
    {
      return this.warehousemen.findWhere({personellId: personnelId});
    },

    findResponseByResponder: function(user)
    {
      return this.requests.find(function(request)
      {
        return request.get('status') === 'accepted' && request.getWhman().id === user.id;
      });
    },

    findRequest: function()
    {
      return this.requests.find(function(request)
      {
        return request.get('status') === 'new';
      });
    },

    acceptRequest: function(request, responder)
    {
      var page = this;

      this.requests.accept(request.id, {id: responder.id, label: responder.getLabel()}, function(err)
      {
        if (err)
        {
          page.showMessage('error', 5000, acceptFailureMessage({
            error: err.message
          }));
        }
        else
        {
          page.showMessage('info', 10000, acceptSuccessMessage({
            whman: responder.getLabel(),
            requestType: request.get('type'),
            orgUnit: request.get('orgUnit'),
            palletKind: request.getFullPalletKind()
          }));
        }
      });
    },

    finishResponse: function(request)
    {
      var page = this;
      var requestType = request.get('type');

      this.requests.finish(request.id, function(err)
      {
        if (err)
        {
          page.showMessage('error', 5000, finishFailureMessage({
            error: err.message
          }));
        }
        else
        {
          page.showMessage('success', 2500, finishSuccessMessage({
            type: requestType,
            line: request.getProdLineId()
          }));
        }
      });
    },

    showMessage: function(type, time, message)
    {
      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
      }

      var $overlay = this.$id('messageOverlay');
      var $message = this.$id('message');

      $overlay.css('display', 'block');
      $message
        .html(message).css({
          display: 'block',
          marginLeft: '-5000px'
        })
        .removeClass('message-error message-warning message-success message-info')
        .addClass('message-' + type);

      $message.css({
        display: 'none',
        marginTop: ($message.outerHeight() / 2 * -1) + 'px',
        marginLeft: ($message.outerWidth() / 2 * -1) + 'px'
      });

      $message.fadeIn();

      this.timers.hideMessage = setTimeout(this.hideMessage.bind(this), time);
    },

    hideMessage: function()
    {
      if (!this.timers.hideMessage)
      {
        return;
      }

      clearTimeout(this.timers.hideMessage);

      var page = this;
      var $overlay = page.$id('messageOverlay');
      var $message = page.$id('message');

      $message.fadeOut(function()
      {
        $overlay.css('display', 'none');
        $message.css('display', 'none');

        page.timers.hideMessage = null;
      });
    },

    collapseEvents: function()
    {
      var $section = this.$('.isa-section-events');

      $section.addClass('is-collapsing');
      $section.css('width', '25px');

      this.timers.collapsed = setTimeout(function() { $section.addClass('is-collapsed'); }, 400);

      localStorage[EVENTS_COLLAPSED_STORAGE_KEY] = '1';
    },

    toggleFullscreen: function()
    {
      this.options.fullscreen = !this.options.fullscreen;

      this.broker.publish('router.navigate', {
        url: '#isa' + (this.options.fullscreen ? '?fullscreen=1' : ''),
        replace: true,
        trigger: false
      });

      this.resize();
    },

    toggleHotkeysVisibility: function()
    {
      if (localStorage[HOTKEYS_VISIBILITY_STORAGE_KEY])
      {
        localStorage.removeItem(HOTKEYS_VISIBILITY_STORAGE_KEY);

        this.$id('hotkeys').addClass('hidden');
      }
      else
      {
        localStorage[HOTKEYS_VISIBILITY_STORAGE_KEY] = '1';

        this.$id('hotkeys').removeClass('hidden');
      }

      this.resize();
    }

  });
});
