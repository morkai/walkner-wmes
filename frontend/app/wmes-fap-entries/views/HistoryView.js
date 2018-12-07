// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-fap-entries/templates/historyItem',
  'app/wmes-fap-entries/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  renderHistoryItem,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        editUrl: this.model.genClientUrl('edit'),
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      return this.model.get('changes').map(this.serializeItem, this);
    },

    serializeItem: function(change, changeIndex)
    {
      var view = this;
      var comment;
      var changes;

      if (change.data && change.data.observer)
      {
        changes = [];
        comment = view.t('history:observer:' + change.data.observer[0]);
      }
      else
      {
        changes = _.map(change.data, function(values, property)
        {
          return {
            label: view.t('PROPERTY:' + property),
            oldValue: view.serializeItemValue(property, values[0], true, changeIndex),
            newValue: view.serializeItemValue(property, values[1], false, changeIndex)
          };
        });
        comment = change.comment.trim();
      }

      return {
        time: time.toTagData(change.date),
        user: renderUserInfo({userInfo: change.user}),
        changes: changes,
        comment: comment
      };
    },

    serializeItemValue: function(property, value)
    {
      if (value == null || value === '')
      {
        return '-';
      }

      if (/At$/i.test(property))
      {
        return time.format(value, 'LLLL');
      }

      switch (property)
      {
        case 'analyzers':
          return value.map(function(u) { return (u.label || '').replace(/\s*\(.*?\)/, ''); }).join(', ');

        case 'status':
        case 'assessment':
          return this.t(property + ':' + value);

        case 'moreAnalysis':
        case 'analysisDone':
          return this.t('core', 'BOOL:' + value);

        case 'problem':
        case 'solution':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        case 'category':
          return value; // TODO

        case 'why5':
          return JSON.stringify(value, null, 2); // TODO

        default:
          return value || '';
      }
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.updateHistory);
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.listenTo(this.model, 'change:changes', this.updateHistory);

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover fap-entries-history-popover"'
        ),
        title: function()
        {
          return $(this).closest('tr').children().first().text();
        }
      });

      if (!this.timers.updateTimes)
      {
        this.timers.updateTimes = setInterval(this.updateTimes.bind(this), 30000);
      }
    },

    updateHistory: function()
    {
      var changes = this.model.get('changes');
      var html = '';

      for (var i = this.lastChangeCount; i < changes.length; ++i)
      {
        html += renderHistoryItem({item: this.serializeItem(changes[i], i)});
      }

      $(html).insertAfter(this.$('.fap-entries-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.fap-entries-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
