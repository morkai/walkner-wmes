// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/localStorage',
  'app/core/View',
  'app/mrl/templates/page'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  localStorage,
  View,
  template
) {
  'use strict';

  var PROBES = [
    null, null,
    'probe1', 'probe1x',
    'probe2', 'probe2x',
    'probe3', 'probe3x',
    'probe4', 'probe4x'
  ];
  var TEST_STATUS = {
    0: 'off',
    1: 'active',
    2: 'success',
    3: 'failure'
  };

  function padStart(value, length, chr)
  {
    while (value.length < length)
    {
      value = chr + value;
    }

    return value;
  }

  function toBits(value)
  {
    return padStart((value || 0).toString(2), 16, '0')
      .split('')
      .map(function(v) { return +v; })
      .reverse();
  }

  return View.extend({

    template: template,

    events: {
      'click #-connection': function()
      {
        localStorage.removeItem('MRL:LINE', '');

        window.location.reload();
      },

      'mousedown #-switchApps': function(e) { this.startActionTimer('switchApps', e); },
      'touchstart #-switchApps': function() { this.startActionTimer('switchApps'); },
      'mouseup #-switchApps': function() { this.stopActionTimer('switchApps'); },
      'touchend #-switchApps': function() { this.stopActionTimer('switchApps'); },

      'mousedown #-reboot': function(e) { this.startActionTimer('reboot', e); },
      'touchstart #-reboot': function() { this.startActionTimer('reboot'); },
      'mouseup #-reboot': function() { this.stopActionTimer('reboot'); },
      'touchend #-reboot': function() { this.stopActionTimer('reboot'); },

      'mousedown #-shutdown': function(e) { this.startActionTimer('shutdown', e); },
      'touchstart #-shutdown': function() { this.startActionTimer('shutdown'); },
      'mouseup #-shutdown': function() { this.stopActionTimer('shutdown'); },
      'touchend #-shutdown': function() { this.stopActionTimer('shutdown'); }
    },

    initialize: function()
    {
      this.actionTimer = {
        action: null,
        time: null
      };
      this.tags = {};
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showParentControls: window.parent !== window
      };
    },

    afterRender: function()
    {
      if (this.model.prodLineId)
      {
        this.setUpWebSocket();
      }

      if (window.parent !== window)
      {
        window.parent.postMessage({type: 'ready', app: 'mrl'}, '*');
      }
    },

    setUpWebSocket: function()
    {
      var view = this;
      var host = window.ENV === 'production' ? '192.168.21.110' : '192.168.1.250:1337';
      var ws = new WebSocket('ws://' + host + '/vis?line=' + encodeURIComponent(view.model.prodLineId));
      var $connection = view.$id('connection').addClass('offline');

      ws.onclose = function()
      {
        $connection.removeClass('online').addClass('offline');

        Object.keys(view.tags).forEach(function(tag)
        {
          view.tags[tag] = null;
        });

        setTimeout(view.setUpWebSocket.bind(view), 1000);
      };

      ws.onmessage = function(e)
      {
        $connection.removeClass('offline').addClass('online');

        view.change(JSON.parse(e.data));
      };
    },

    change: function(changes)
    {
      Object.assign(this.tags, changes);

      this.update(Object.keys(changes));
    },

    update: function(changedTags)
    {
      var view = this;

      changedTags.forEach(function(tag)
      {
        var value = view.tags[tag];
        var bits = toBits(value);

        view.updateBits(tag, bits);
        view.updateLeds(tag, bits);

        if (view.updaters[tag])
        {
          view.updaters[tag].call(view, value, bits);
        }
      });
    },

    updateBits: function(tag, bits)
    {
      var $bits = this.$('.mrl-bits[data-tag="' + tag + '"]');

      if ($bits.length)
      {
        $bits.text('[' + bits.slice(0, /^probe/.test(tag) ? 7 : 11).reverse().join(' ') + ']');
      }
    },

    updateLeds: function(tag, bits)
    {
      this.$('.mrl-led[data-tag="' + tag + '"]').each(function()
      {
        this.classList.remove('mrl-on', 'mrl-off');
        this.classList.add(bits[this.dataset.bit] ? 'mrl-on' : 'mrl-off');
      });
    },

    updateTest: function(tag, status)
    {
      this.$('[data-tag="' + tag + '"]')
        .removeClass('mor-off mor-active mor-success mor-failure')
        .addClass('mor-' + TEST_STATUS[status || 0]);
    },

    updaters: {

      activeProbes: function(value, bits)
      {
        this.$el.removeClass('core5 core7').addClass(bits[10] ? 'core7' : 'core5');

        for (var i = 2; i <= 9; ++i)
        {
          this.$('tr[data-tag="' + PROBES[i] + '"]').toggleClass('inactive', bits[i] === 0);
        }
      },

      sn: function(sn)
      {
        this.$('[data-tag="sn"]').text(sn || '-');
      },

      order: function(order)
      {
        this.$('[data-tag="order"]').text(order || '-');
      },

      action: function(value)
      {
        this.$('[data-tag="action"]').text(t('mrl', 'action:' + (value || 0)));
      },

      result: function(value)
      {
        this.$('[data-tag="result"]').text(t('mrl', 'result:' + (value || 0)));
      },

      pe: function(value)
      {
        this.updateTest('pe', value);
      },

      iso: function(value)
      {
        this.updateTest('iso', value);
      }

    },

    startActionTimer: function(action, e)
    {
      this.actionTimer.action = action;
      this.actionTimer.time = Date.now();

      if (e)
      {
        e.preventDefault();
      }
    },

    stopActionTimer: function(action)
    {
      if (this.actionTimer.action !== action)
      {
        return;
      }

      var long = (Date.now() - this.actionTimer.time) > 3000;

      if (action === 'switchApps')
      {
        if (long)
        {
          window.parent.postMessage({type: 'config'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'switch', app: 'mrl'}, '*');
        }
      }
      else if (action === 'reboot')
      {
        if (long)
        {
          window.parent.postMessage({type: 'reboot'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'refresh'}, '*');
        }
      }
      else if (long && action === 'shutdown')
      {
        window.parent.postMessage({type: 'shutdown'}, '*');
      }

      this.actionTimer.action = null;
      this.actionTimer.time = null;
    }

  });
});
