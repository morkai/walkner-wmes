// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/bomChecker',
  'app/production/templates/bomCheckerRow'
], function(
  $,
  t,
  viewport,
  View,
  template,
  rowTemplate
) {
  'use strict';

  return View.extend({

    snManagerMode: 'bom',

    template: template,

    dialogClassName: 'production-modal production-bomChecker-modal',

    events: {

      'click .production-bomChecker-reset': function(e)
      {
        this.updateComponent(this.components[this.$(e.target).closest('tr').attr('data-id')], 'todo');

        return false;
      }

    },

    initialize: function()
    {
      var orderData = this.model.orderData;
      var scanInfo = this.model.logEntry.data;

      this.components = [{
        _id: 0,
        status: scanInfo.serialNo ? 'success' : 'todo',
        nc12: orderData.no,
        description: orderData.description,
        single: true,
        unique: true,
        patternInfo: {
          pattern: /([A-Z0-9]{4}\.([0-9]{9})\.([0-9]{4}))(?:[^.]|$)/,
          nc12: [2],
          sn: [3]
        },
        scanInfo: {
          raw: scanInfo.serialNo ? scanInfo._id : '?',
          nc12: orderData.no,
          sn: scanInfo.serialNo
        },
        icon: scanInfo.serialNo ? 'fa-thumbs-up' : 'fa-question',
        message: t('production', 'bomChecker:message:' + (scanInfo.serialNo ? 'success' : 'todo') + ':sn')
      }].concat(this.model.components.map(function(component, i)
      {
        return {
          _id: i + 1,
          status: 'todo',
          nc12: component.nc12,
          description: component.description,
          single: component.single,
          unique: component.unique,
          patternInfo: {
            pattern: new RegExp(component.labelPattern),
            nc12: component.nc12Index,
            sn: component.snIndex
          },
          scanInfo: {
            raw: '?',
            nc12: '',
            sn: ''
          },
          icon: 'fa-question',
          message: t('production', 'bomChecker:message:todo')
        };
      }));
    },

    afterRender: function()
    {
      var view = this;
      var html = [];

      view.components.forEach(function(component)
      {
        html.push(view.renderPartial(rowTemplate, {component: component}));
      });

      view.$id('components').append(html);
    },

    onSnScanned: function(scanInfo)
    {
      var scanBuffer = scanInfo._id;

      for (var i = 0; i < this.components.length; ++i)
      {
        var component = this.components[i];

        var matches = scanBuffer.match(component.patternInfo.pattern);

        if (!matches)
        {
          continue;
        }

        if (component.unique && component.scanInfo.raw === scanBuffer)
        {
          return this.updateComponent(component, 'todo');
        }

        if (!component.single && (component.status === 'success' || component.status === 'checking'))
        {
          continue;
        }

        component.scanInfo.raw = scanBuffer;

        if (component._id === 0)
        {
          component.scanInfo.nc12 = scanInfo.orderNo;
          component.scanInfo.sn = scanInfo.serialNo;
        }
        else
        {
          component.scanInfo.nc12 = component.nc12;
          component.scanInfo.sn = '';

          component.patternInfo.nc12.forEach(function(index) // eslint-disable-line
          {
            if (matches[index])
            {
              component.scanInfo.nc12 = matches[index];
            }
          });

          component.patternInfo.sn.forEach(function(index) // eslint-disable-line
          {
            if (matches[index])
            {
              component.scanInfo.sn = matches[index];
            }
          });
        }

        return this.handleComponent(component);
      }

      this.snMessage.show(scanInfo, 'error', 'BOM_CHECKER:NO_MATCH');
    },

    handleComponent: function(component)
    {
      var view = this;

      if (component.scanInfo.nc12 !== component.nc12)
      {
        return view.updateComponent(
          component,
          'failure',
          t('production', 'bomChecker:message:nc12', {nc12: component.nc12})
        );
      }

      if (component.unique)
      {
        view.updateComponent(component, 'checking');

        var req = view.ajax({
          method: 'POST',
          url: '/production/checkAnySerialNumber',
          data: JSON.stringify({
            sn: component._id === 0
              ? component.scanInfo.raw
              : (component.scanInfo.nc12 + ':' + component.scanInfo.sn)
          }),
          timeout: 6000
        });

        req.fail(function()
        {
          view.updateComponent(component, 'failure');
        });

        req.done(function(psn)
        {
          if (psn)
          {
            view.updateComponent(
              component,
              'failure',
              t('production', 'bomChecker:message:used' + (component._id === 0 ? ':sn' : ''), {psn: psn})
            );
          }
          else
          {
            success();
          }
        });
      }
      else
      {
        success();
      }

      function success()
      {
        view.updateComponent(component, 'success');

        if (view.timers)
        {
          clearTimeout(view.timers.checkAll);
          view.timers.checkAll = setTimeout(view.checkAll.bind(view), 333);
        }
      }
    },

    checkAll: function()
    {
      var incomplete = this.components.filter(function(c) { return c.status !== 'success'; });

      if (incomplete.length)
      {
        return;
      }

      var scanInfo = this.model.logEntry.data;

      scanInfo.scannedAt = new Date().toISOString();
      scanInfo.bom = [];

      this.components.forEach(function(component)
      {
        if (component._id === 0)
        {
          scanInfo.orderNo = component.scanInfo.nc12;
          scanInfo.serialNo = component.scanInfo.sn;
        }
        else
        {
          scanInfo.bom.push(component.scanInfo.nc12 + ':' + component.scanInfo.sn);
        }
      });

      this.trigger('checked', this.model.logEntry);
    },

    updateComponent: function(component, status, message)
    {
      if (status)
      {
        component.status = status;
      }

      switch (component.status)
      {
        case 'checking':
          component.icon = 'fa-spinner fa-spin';
          break;

        case 'failure':
          component.icon = 'fa-thumbs-down';
          break;

        case 'success':
          component.icon = 'fa-thumbs-up';
          break;

        case 'todo':
          component.icon = 'fa-question';
          component.scanInfo.raw = '?';
          break;
      }

      if (message)
      {
        component.message = message;
      }
      else
      {
        component.message = t(
          'production',
          'bomChecker:message:' + component.status + (component._id === 0 ? ':sn' : '')
        );
      }

      if (component._id === 0)
      {
        this.model.logEntry.data._id = component.scanInfo.raw;
        this.model.logEntry.data.serialNo = component.scanInfo.sn;
      }

      this.$('tr[data-id="' + component._id + '"]').replaceWith(
        this.renderPartial(rowTemplate, {component: component})
      );
    }

  });
});
