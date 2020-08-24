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
  '../dictionaries',
  'app/wmes-compRel-entries/templates/historyItem',
  'app/wmes-compRel-entries/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  dictionaries,
  renderHistoryItem,
  template
) {
  'use strict';

  var IGNORED_PROPS = {
    subdivisions: true,
    unsubscribed: true
  };

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      return this.model.get('changes').map(this.serializeItem, this).filter(function(change)
      {
        return !!change.comment || !!change.changes.length;
      });
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
          if (IGNORED_PROPS[property])
          {
            return null;
          }

          property = property.split('$')[0];

          if (property === 'subscribers')
          {
            property = 'observers';
          }

          return {
            label: view.t('PROPERTY:' + property),
            oldValue: view.serializeItemValue(property, values[0], true, changeIndex),
            newValue: view.serializeItemValue(property, values[1], false, changeIndex)
          };
        }).filter(function(change)
        {
          return !!change;
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
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0))
      {
        return '-';
      }

      if (value === 0)
      {
        return 0;
      }

      if (/At$/i.test(property))
      {
        return time.format(value, 'LLLL');
      }

      if (typeof value === 'boolean')
      {
        return this.t('core', 'BOOL:' + value);
      }

      if (typeof value === 'string')
      {
        value = _.escape(value);
      }

      switch (property)
      {
        case 'observers':
        case 'analyzers':
        {
          value = value.map(function(u) { return (u.label || '').replace(/\s*\(.*?\)/, ''); }).join(', ');

          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };
        }

        case 'status':
        case 'assessment':
          return this.t(property + ':' + value);

        case 'productName':
        case 'componentName':
        case 'problem':
        case 'solution':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        case 'category':
        {
          var category = dictionaries.categories.get(value);

          return category ? category.getLabel() : value;
        }

        case 'subCategory':
        {
          var subCategory = dictionaries.subCategories.get(value);

          return subCategory ? subCategory.getLabel() : value;
        }

        case 'why5':
        {
          value = value.filter(function(v) { return !!v; });

          if (!value.length)
          {
            return '-';
          }

          return '<ol><li>' + value.join('<li>') + '</ol>';
        }

        case 'attachments':
        {
          return '<ul><li>' + value.map(function(a) { return a.name; }).join('<li>') + '</ul>';
        }

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
          'class="popover compRel-entries-history-popover"'
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

      $(html).insertAfter(this.$('.compRel-entries-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.compRel-entries-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
