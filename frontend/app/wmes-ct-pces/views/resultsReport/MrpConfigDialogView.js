// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wmes-ct-pces/templates/resultsReport/mrpConfig'
], function(
  $,
  time,
  viewport,
  View,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .btn[data-role="add"]': function()
      {
        this.renderConfig({
          date: null,
          unbalance: 0,
          bottleneck: 0
        });
      },
      'click .btn[data-role="remove"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').fadeOut('fast', function()
        {
          this.parentNode.removeChild(this);
        });
      },
      'submit': function()
      {
        this.submit();

        return false;
      },
      'change input[type="date"]': function()
      {
        this.sortConfigs();
      }
    },

    initialize: function()
    {
      this.listenToOnce(this.model, 'change', this.onModelLoaded);
    },

    getTemplateData: function()
    {
      return {
        minDate: window.PRODUCTION_DATA_START_DATE || time.format(Date.now(), 'YYYY-01-01'),
        maxDate: time.getMoment().add(1, 'years').format('YYYY-MM-DD')
      };
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('id').prop('disabled', true).val(this.model.id), {
        view: this,
        own: false,
        width: '100%',
        maximumSelectionSize: 1
      });

      this.load();
    },

    load: function()
    {
      var view = this;

      viewport.msg.loading();

      var req = view.model.fetch();

      req.fail(function()
      {
        if (req.status === 404)
        {
          viewport.msg.loaded();

          view.model.id = null;
          view.model.set({configs: []});
        }
        else
        {
          viewport.msg.loadingFailed();
          viewport.closeDialog();
        }
      });

      req.done(function(data)
      {
        viewport.msg.loaded();
        view.model.set(data);
      });
    },

    submit: function()
    {
      var view = this;
      var configs = [];

      view.$id('.btn-primary').prop('disabled', true);

      view.$id('configs').children().each(function()
      {
        var config = {
          date: this.querySelector('input[name$="date"]').value + 'T00:00:00Z',
          unbalance: +this.querySelector('input[name$="unbalance"]').value,
          bottleneck: +this.querySelector('input[name$="bottleneck"]').value
        };

        if (!time.utc.getMoment(config.date).isValid())
        {
          return;
        }

        if (!(config.unbalance >= 0))
        {
          config.unbalance = 0;
        }

        if (!(config.bottleneck >= 0))
        {
          config.bottleneck = 0;
        }

        configs.push(config);
      });

      view.model.set('configs', configs);

      viewport.msg.saving();

      var req = view.model.save();

      req.fail(function()
      {
        viewport.msg.savingFailed();
        view.$id('.btn-primary').prop('disabled', false);
      });

      req.done(function()
      {
        view.model.trigger('save');
        viewport.msg.saved();
        viewport.closeDialog();
      });
    },

    onModelLoaded: function()
    {
      this.model.get('configs').forEach(this.renderConfig, this);
      this.$('.btn[data-role="add"]').prop('disabled', false);
    },

    renderConfig: function(config)
    {
      if (!this.$configRow)
      {
        this.$configRow = this.$id('configs').children().first().detach();
      }

      var $configRow = this.$configRow.clone();

      $configRow.find('input[name$="date"]').val(config.date ? time.utc.format(config.date, 'YYYY-MM-DD') : '');
      $configRow.find('input[name$="unbalance"]').val(config.unbalance);
      $configRow.find('input[name$="bottleneck"]').val(config.bottleneck);

      this.$id('configs').append($configRow);
    },

    sortConfigs: function()
    {
      var configs = [];
      var $configs = this.$id('configs');
      var focusedEl = document.activeElement;

      if (!$(focusedEl).closest('tbody[data-role="configs"]').length)
      {
        focusedEl = null;
      }

      $configs.children().each(function()
      {
        var date = time.utc.getMoment(this.querySelector('input[type="date"]').value, 'YYYY-MM-DD');

        configs.push({
          time: date.isValid() ? date.valueOf() : Number.MAX_SAFE_INTEGER,
          $el: $(this).detach()
        });
      });

      configs.sort(function(a, b) { return a.time - b.time; });

      configs.forEach(function(config)
      {
        $configs.append(config.$el);
      });

      if (focusedEl)
      {
        focusedEl.focus();
      }
    }

  });
});
