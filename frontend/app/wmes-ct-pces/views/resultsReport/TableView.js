// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/wmes-ct-pces/templates/resultsReport/table'
], function(
  time,
  View,
  template
) {
  'use strict';

  function formatDuration(seconds)
  {
    var str = '';

    if (!seconds || seconds < 1)
    {
      return str;
    }

    seconds = Math.round(seconds);

    var minutes = Math.floor(seconds / 60);

    if (minutes > 0)
    {
      if (minutes > 99)
      {
        minutes = 99;
      }
      else if (minutes < 10)
      {
        str += '0';
      }

      str += minutes + ':';
      seconds %= 60;
    }
    else
    {
      str += '00:';
    }

    if (seconds > 0)
    {
      if (seconds < 10)
      {
        str += '0';
      }

      str += seconds;
    }
    else
    {
      str += '00';
    }

    return str;
  }

  return View.extend({

    template: template,

    events: {
      'click a[data-tab]': function(e)
      {
        this.model.set('tab', e.currentTarget.dataset.tab);
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:tab', this.toggleTab);
    },

    getTemplateData: function()
    {
      return {
        selectedTab: this.model.get('tab'),
        report: this.model.get('report')
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        selector: 'td[data-id]',
        container: view.el,
        trigger: 'hover',
        placement: 'auto right',
        html: true,
        content: function()
        {
          var report = view.model.get('report');
          var groups = report[view.$(this).closest('.tab-pane')[0].dataset.tab];
          var group = groups[+this.parentNode.dataset.i];

          if (this.dataset.id === 'unbalance')
          {
            return view.serializeUnbalance(group);
          }

          if (this.dataset.id === 'bottleneck')
          {
            return view.serializeBottleneck(group);
          }

          return undefined;
        }
      });

      view.toggleTab();
    },

    toggleTab: function()
    {
      this.$('.tab-pane.active').removeClass('active');
      this.$('.tab-pane[data-tab="' + this.model.get('tab') + '"]').addClass('active');
    },

    serializeUnbalance: function(group)
    {
      if (!group.avgMed.length)
      {
        return undefined;
      }

      var html = '<table><thead><tr>';

      html += '<th class="is-min" style="padding-right: 10px">' + this.t('resultsReport:table:st');
      html += '<th class="is-min">' + this.t('resultsReport:table:ct');
      html += '<tbody>';

      group.avgMed.forEach(function(avgMed)
      {
        html += '<tr>';
        html += '<td class="is-min text-fixed text-right" style="padding-right: 10px">' + avgMed.station;
        html += '<td class="is-min text-fixed">' + formatDuration(avgMed.value / 1000);
      });

      html += '</table>';

      return html;
    },

    serializeBottleneck: function(group)
    {
      if (!group.bottleneck.length)
      {
        return undefined;
      }

      var html = '<table><thead><tr>';

      html += '<th class="is-min" style="padding-right: 10px">' + this.t('resultsReport:table:st');
      html += '<th class="is-min">' + this.t('resultsReport:table:bn');
      html += '<tbody>';

      group.bottleneck.forEach(function(bn)
      {
        html += '<tr>';
        html += '<td class="is-min text-fixed text-right" style="padding-right: 10px">' + bn.station;
        html += '<td class="is-min text-fixed">' + bn.count;
      });

      html += '</table>';

      return html;
    }

  });
});
