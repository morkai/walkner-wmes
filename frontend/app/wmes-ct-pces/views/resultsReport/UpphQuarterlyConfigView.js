// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/Model',
  'app/wmes-ct-pces/templates/resultsReport/upphQuarterlyConfig'
], function(
  time,
  viewport,
  View,
  Model,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.submitForm();

        return false;
      },
      'input #-year': 'updateId',
      'change #-year': 'updateId',
      'input #-quarter': 'updateId',
      'change #-quarter': 'updateId'
    },

    initialize: function()
    {
      this.model = Object.assign(new Model(), {
        urlRoot: '/ct/upphQuarterlyConfigs',
        nlsDomain: 'wmes-ct-pces'
      });

      this.listenTo(this.model, 'change:_id', this.loadData);
      this.listenTo(this.model, 'sync', this.updateData);
      this.once('afterRender', function()
      {
        this.$id('year').val(time.getMoment().year());
        this.$id('quarter').val(time.getMoment().quarter());
        this.updateId();
      });
    },

    getTemplateData: function()
    {
      return {
        minYear: (window.PRODUCTION_DATA_START_DATE || '2020-01-01').split('-')[0],
        maxYear: time.getMoment().add(1, 'years').format('YYYY')
      };
    },

    updateId: function()
    {
      var year = +this.$id('year').val();
      var quarter = +this.$id('quarter').val();
      var moment = time.utc.getMoment()
        .startOf('year')
        .year(year)
        .quarter(Math.min(4, quarter));
      var id = year && quarter && moment.isValid() ? moment.toISOString() : undefined;

      if (id !== this.model.id)
      {
        this.model.set({
          _id: id,
          configs: []
        });
        this.updateData();
      }
    },

    loadData: function()
    {
      var view = this;

      if (view.loadReq)
      {
        view.loadReq.abort();
        view.loadReq = null;
      }

      if (!view.model.id)
      {
        return;
      }

      if (view.timers.loadData)
      {
        clearTimeout(view.timers.loadData);
      }
      else
      {
        viewport.msg.loading();
      }

      view.timers.loadData = setTimeout(function()
      {
        view.timers.loadData = null;

        if (!view.model.id)
        {
          viewport.msg.loaded();

          return;
        }

        var req = view.loadReq = view.promised(view.model.fetch());

        req.fail(function()
        {
          if (req.statusText === 'abort')
          {
            viewport.msg.loaded();
          }
          else if (req.status === 404)
          {
            viewport.msg.loaded();
            view.model.set('configs', []);
            view.updateData();
          }
          else
          {
            viewport.msg.loadingFailed();
          }
        });

        req.done(function()
        {
          viewport.msg.loaded();
        });
      }, 100);
    },

    updateData: function()
    {
      if (this.model.id)
      {
        var moment = time.utc.getMoment(this.model.id);

        this.$id('year').val(moment.year());
        this.$id('quarter').val(moment.quarter());
      }

      this.$id('coeffs').val(this.formatCoeffs());
    },

    formatCoeffs: function()
    {
      var lines = [];

      this.model.get('configs').forEach(function(config)
      {
        if (!config.qtyCoeff || !config.mrps.length)
        {
          return;
        }

        var qtyCoeff = config.qtyCoeff.toLocaleString();
        var mrps = config.mrps.join(', ');

        lines.push(qtyCoeff + ': ' + mrps);
      });

      return lines.join('\n');
    },

    serializeConfigs: function()
    {
      var configs = [];

      this.$id('coeffs').val().split('\n').forEach(function(line)
      {
        var parts = line.split(':');

        if (parts.length !== 2)
        {
          return;
        }

        var qtyCoeff = parseFloat(parts[0].replace(',', '.'));

        if (!qtyCoeff || qtyCoeff < 0)
        {
          return;
        }

        var mrps = parts[1]
          .split(',')
          .map(function(v) { return v.trim(); })
          .filter(function(v) { return v.length; });

        if (!mrps.length)
        {
          return;
        }

        configs.push({
          mrps: mrps,
          qtyCoeff: qtyCoeff
        });
      });

      return configs;
    },

    submitForm: function()
    {
      var view = this;

      viewport.msg.saving();

      var $fields = view.$('.form-control, .btn-primary').prop('disabled', true);

      view.model.set('configs', view.serializeConfigs());

      var req = view.promised(view.model.save());

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
      });

      req.always(function()
      {
        $fields.prop('disabled', false);
      });
    }

  });
});
