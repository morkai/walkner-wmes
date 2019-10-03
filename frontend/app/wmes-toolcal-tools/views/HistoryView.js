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
  'app/wmes-toolcal-tools/dictionaries',
  'app/wmes-toolcal-tools/templates/historyItem',
  'app/wmes-toolcal-tools/templates/history'
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

  return View.extend({

    template: template,

    events: {

      'submit form': function()
      {
        var view = this;
        var $comment = view.$id('comment');
        var comment = $comment.val().trim();

        if (comment === '')
        {
          return false;
        }

        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          type: 'PUT',
          url: '/toolcal/tools/' + view.model.id,
          data: JSON.stringify({comment: comment})
        });

        req.done(function()
        {
          $comment.val('');
        });

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('MSG:comment:failure')
          });
        });

        req.always(function()
        {
          $submit.prop('disabled', false);
        });

        return false;
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:changes', this.updateHistory);
      });
    },

    getTemplateData: function()
    {
      return {
        canEdit: this.model.canEdit(),
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

      if (/Date$/i.test(property))
      {
        return time.format(value, 'LL');
      }

      switch (property)
      {
        case 'users':
          return value.map(function(u) { return (u.label || '').replace(/\s*\(.*?\)/, ''); }).join(', ');

        case 'status':
          return this.t('status:' + value);

        case 'intervalUnit':
          return this.t('interval:unit:' + value);

        case 'type':
        {
          var model = dictionaries.forProperty(property).get(value);

          return model ? model.getLabel() : value;
        }

        case 'name':
        case 'sn':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        default:
          return value || '';
      }
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover toolcal-tools-history-popover"'
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

      var $newItem = $(html);
      var $lastItem = this.$('.toolcal-tools-history-item').last();

      if ($lastItem.length)
      {
        $newItem.insertAfter($lastItem);
      }
      else
      {
        $newItem.insertAfter(this.$('.panel-heading'));
      }

      $newItem.addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.toolcal-tools-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
