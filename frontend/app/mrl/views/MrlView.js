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

  var MRL_HOST = window.ENV === 'production' ? '192.168.21.110' : '192.168.1.250:1337';
  var PROBES = [
    null, null,
    'probe1', 'probe1x',
    'probe2', 'probe2x',
    'probe3', 'probe3x',
    'probe4', 'probe4x'
  ];
  var TEST_STATUS = {
    0: 'off',
    1: 'progress',
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

      'click #-start': function()
      {
        this.ws.send('start');

        this.lockButtons();
      },

      'click #-reset': function()
      {
        this.ws.send('reset');

        this.lockButtons();
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

      this.once('afterRender', function()
      {
        if (this.model.prodLineId)
        {
          this.setUpWebSocket();
        }

        if (window.parent !== window)
        {
          window.parent.postMessage({type: 'ready', app: 'mrl'}, '*');
        }
      });
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.ws.close();
      this.ws = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: window.parent !== window
      };
    },

    afterRender: function()
    {

    },

    setUpWebSocket: function()
    {
      var view = this;
      var ws = new WebSocket('ws://' + MRL_HOST + '/vis?line=' + encodeURIComponent(view.model.prodLineId));
      var $connection = view.$id('connection').addClass('offline');

      ws.onclose = function()
      {
        $connection.removeClass('online').addClass('offline');

        Object.keys(view.tags).forEach(function(tag)
        {
          view.tags[tag] = null;
        });

        view.render();

        setTimeout(view.setUpWebSocket.bind(view), 1000);
      };

      ws.onmessage = function(e)
      {
        $connection.removeClass('offline').addClass('online');

        view.change(JSON.parse(e.data));
      };

      view.ws = ws;
    },

    lockButtons: function()
    {
      var $buttons = this.$id('buttons').find('.btn').prop('disabled', true);

      setTimeout(function() { $buttons.prop('disabled', false); }, 2000);
    },

    change: function(changes)
    {
      Object.assign(this.tags, changes);

      this.update(changes);
    },

    update: function(changes)
    {
      var view = this;

      Object.keys(changes).forEach(function(tag)
      {
        var value = view.tags[tag];
        var bits = null;

        if (typeof value === 'number')
        {
          bits = toBits(value);

          view.updateBits(tag, bits);
          view.updateLeds(tag, bits);
        }

        if (view.updaters[tag])
        {
          view.updaters[tag].call(view, value, bits, tag);
        }

        if (/^orderQty/.test(tag))
        {
          view.updateOrderQty();
        }
        else if (/^probe/.test(tag))
        {
          view.updateProbeValidity(tag);
        }
      });

      if ((changes.pe !== undefined && changes.pe === 3)
        || (changes.iso !== undefined && (changes.iso === 2 || changes.iso === 3)))
      {
        view.updateOverallValidity();
      }
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
        .removeClass('mrl-off mrl-progress mrl-success mrl-failure')
        .addClass('mrl-' + TEST_STATUS[status || 0]);
    },

    updateProbeValidity: function(tag)
    {
      var probeN = tag.match(/^probe([0-9]+)x?$/)[1];
      var $probe = this.$id('probe' + probeN);
      var $leds = $probe.find('.mrl-led[data-tag="' + tag + '"]');
      var requiredCount = this.$el.hasClass('core7') ? 7 : 5;
      var actualCount = requiredCount === 7 ? $leds.filter('.mrl-on').length : 0;

      if (requiredCount === 5)
      {
        for (var i = 1; i < 6; ++i)
        {
          actualCount += $leds[i].classList.contains('mrl-on') ? 1 : 0;
        }
      }

      $probe
        .find('tr[data-tag="' + tag + '"]')
        .removeClass('mrl-valid mrl-invalid')
        .addClass(actualCount === requiredCount ? 'mrl-valid' : 'mrl-invalid');

      var valid = true;

      $probe.find('tr[data-tag]').each(function()
      {
        if (this.classList.contains('mrl-inactive'))
        {
          return;
        }

        valid = valid && this.classList.contains('mrl-valid');
      });

      $probe.removeClass('mrl-invalid mrl-valid').addClass(valid ? 'mrl-valid' : 'mrl-invalid');
    },

    updateOverallValidity: function()
    {
      var view = this;

      if (!view.timers.clearOverallValidity)
      {
        clearTimeout(view.timers.clearOverallValidity);
      }

      document.body.classList.remove('mrl-valid', 'mrl-invalid');

      if (this.tags.pe === 2 && this.tags.iso === 2 && this.$('.probe.mrl-invalid').length === 0)
      {
        document.body.classList.add('mrl-valid');
      }
      else if (this.tags.pe === 3 || this.tags.iso === 3 || this.$('.probe.mrl-invalid').length !== 0)
      {
        document.body.classList.add('mrl-invalid');
      }

      view.timers.clearOverallValidity = setTimeout(
        function() { document.body.classList.remove('mrl-valid', 'mrl-invalid'); },
        5000
      );
    },

    updateOrderQty: function()
    {
      this.$('.mrl-prop-value[data-tag="orderQty"]').text(
        (this.tags.orderQtyLineDone || '0')
        + ' / ' + (this.tags.orderQtyTotalDone || '0')
        + ' / ' + (this.tags.orderQtyTodo || '0')
      );
    },

    updaters: {

      activeProbes: function(value, bits)
      {
        this.$el.removeClass('core5 core7').addClass(bits[10] ? 'core7' : 'core5');

        for (var i = 2; i <= 9; ++i)
        {
          this.$('tr[data-tag="' + PROBES[i] + '"]')
            .removeClass('mrl-inactive mrl-active')
            .addClass(bits[i] === 0 ? 'mrl-inactive' : 'mrl-active');

          this.updateProbeValidity(PROBES[i]);
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
