// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/bomChecker'
], function(
  $,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    snManagerMode: 'bom',

    template: template,

    dialogClassName: 'production-modal production-bomChecker-modal',

    localTopics: {

      'production.taktTime.snScanned': 'onSnScanned'

    },

    getTemplateData: function()
    {
      return {
        components: this.model.components
      };
    },

    onSnScanned: function(scanInfo)
    {
      if (scanInfo.orderNo)
      {
        return this.snMessage.show(scanInfo, 'error', 'BOM_CHECKER:NO_ORDER');
      }

      for (var i = 0; i < this.model.components.length; ++i)
      {
        var matcher = this.model.components[i];
        var pattern = null;

        try
        {
          pattern = new RegExp(matcher.pattern);
        }
        catch (err)
        {
          continue;
        }

        var matches = scanInfo._id.match(pattern);

        if (!matches)
        {
          continue;
        }

        var nc12 = matcher.nc12;
        var sn = '';

        matcher.nc12Index.forEach(function(index) // eslint-disable-line
        {
          if (matches[index])
          {
            nc12 = matches[index];
          }
        });

        matcher.snIndex.forEach(function(index) // eslint-disable-line
        {
          if (matches[index])
          {
            sn = matches[index];
          }
        });

        return this.handleComponent(i, scanInfo._id, matcher, nc12, sn);
      }

      this.snMessage.show(scanInfo, 'error', 'BOM_CHECKER:NO_MATCH');
    },

    handleComponent: function(i, scanBuffer, matcher, nc12, sn)
    {
      var view = this;
      var $row = view.$('tr[data-i="' + i + '"]');
      var $icon = $row.find('.fa');
      var $scanBuffer = $row.find('.production-bomChecker-scanBuffer');
      var $message = $row.find('.production-bomChecker-message');

      if (nc12 !== matcher.nc12)
      {
        return failure(t('production', 'bomChecker:message:nc12', {nc12: nc12}));
      }

      if (matcher.unique)
      {
        $row.attr('data-status', 'checking');
        $icon.attr('class', 'fa fa-spinner fa-spin');
        $scanBuffer.text(scanBuffer);
        $message.text(t('production', 'bomChecker:message:checking'));

        var req = view.ajax({
          method: 'POST',
          url: '/production/checkBomSerialNumber',
          data: JSON.stringify({sn: nc12 + ':' + sn}),
          timeout: 6000
        });

        req.fail(function()
        {
          failure(t('production', 'bomChecker:message:failure'));
        });

        req.done(function(psn)
        {
          if (psn)
          {
            failure(t('production', 'bomChecker:message:used', {psn: psn}));
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
        $row.attr('data-status', 'success').attr('data-sn', nc12 + ':' + sn);
        $icon.attr('class', 'fa fa-check');
        $scanBuffer.text(scanBuffer);
        $message.text(t('production', 'bomChecker:message:success'));

        clearTimeout(view.timers.checkAll);
        view.timers.checkAll = setTimeout(view.checkAll.bind(view), 333);
      }

      function failure(message)
      {
        $row.attr('data-status', 'failure');
        $icon.attr('class', 'fa fa-times');
        $message.text(message);
      }
    },

    checkAll: function()
    {
      if (this.$('tr[data-status="success"]').length === this.model.components.length)
      {
        this.trigger('checked', this.$('tr[data-sn]').map(function() { return this.dataset.sn; }).get());
      }
    }

  });
});
