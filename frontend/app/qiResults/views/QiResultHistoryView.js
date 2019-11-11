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
  'app/qiResults/QiResult',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/correctiveActionsTable',
  'app/qiResults/templates/historyItem',
  'app/qiResults/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  QiResult,
  qiDictionaries,
  renderCorrectiveActionsTable,
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
          url: '/qi/results/' + view.model.id,
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
      },

      'click .qiResults-history-correctiveActions': 'toggleCorrectiveActions'

    },

    initialize: function()
    {
      this.lastChangeCount = 0;
      this.$lastToggle = null;
      this.$lastTable = null;
    },

    destroy: function()
    {
      if (this.$lastToggle)
      {
        this.$lastTable.remove();
        this.$lastTable = null;
        this.$lastToggle = null;
      }

      this.$el.popover('destroy');
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
      var items = (this.model.get('changes') || []).map(this.serializeItem, this);

      items.unshift(this.serializeItem({
        user: this.model.get('creator'),
        date: this.model.get('createdAt'),
        data: {},
        comment: this.t('history:added')
      }, 0));

      return items;
    },

    serializeItem: function(change, changeIndex)
    {
      return {
        seen: true,
        time: time.toTagData(change.date),
        user: renderUserInfo({userInfo: change.user}),
        changes: _.map(change.data, function(values, property)
        {
          return {
            label: this.t('PROPERTY:' + property),
            oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
            newValue: this.serializeItemValue(property, values[1], false, changeIndex)
          };
        }, this),
        comment: change.comment.trim()
      };
    },

    serializeItemValue: function(property, value, isOld, changeIndex)
    {
      if (property === 'ok')
      {
        return this.t('ok:' + value);
      }

      if (typeof value === 'number')
      {
        return value.toLocaleString();
      }

      if (_.isEmpty(value))
      {
        return '-';
      }

      var more = null;

      if (property === 'rootCause')
      {
        more = '';

        value.forEach(function(rootCause)
        {
          more += '<ol>';

          rootCause.forEach(function(why)
          {
            more += '<li>' + _.escape(why) + '</li>';
          });

          more += '</ol>';
        });

        value = value[0].join('\n');
      }

      switch (property)
      {
        case 'inspectedAt':
          return time.format(value, 'LL');

        case 'inspector':
        case 'nokOwner':
        case 'leader':
        case 'coach':
          return renderUserInfo({userInfo: value});

        case 'kind':
        case 'errorCategory':
        case 'faultCode':
        case 'standard':
        {
          var model = qiDictionaries.forProperty(property).get(value);

          return model ? model.getLabel() : value;
        }

        case 'okFile':
        case 'nokFile':
          return '<a href="/qi/results/' + this.model.id
            + '/attachments/' + property
            + '?change=' + (isOld ? -changeIndex : changeIndex) + '">'
            + _.escape(value.name) + '</a>';

        case 'correctiveActions':
          return '<a class="qiResults-history-correctiveActions" data-property="' + property + '"'
            + ' data-index="' + changeIndex + '" data-which="' + (isOld ? '0' : '1') + '">'
            + this.t('history:correctiveActions', {count: value.length})
            + '</a>';

        case 'serialNumbers':
          return value.join(', ');

        default:
          return value.length <= 43 ? value : {
            more: more || value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };
      }
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.updateHistory);
    },

    afterRender: function()
    {
      this.lastChangeCount = (this.model.get('changes') || []).length;

      this.listenTo(this.model, 'change:changes', this.updateHistory);

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        html: true,
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover qiResults-history-popover"'
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
        html += this.renderPartialHtml(renderHistoryItem, {item: this.serializeItem(changes[i], i)});
      }

      $(html).insertAfter(this.$('.qiResults-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.qiResults-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    },

    toggleCorrectiveActions: function(e)
    {
      var hideOnly = false;

      if (this.$lastToggle)
      {
        hideOnly = this.$lastToggle[0] === e.target;

        this.$lastTable.remove();
        this.$lastTable = null;
        this.$lastToggle = null;
      }

      if (hideOnly)
      {
        return;
      }

      var dataset = e.target.dataset;
      var $toggle = this.$(e.target);
      var $parent = $toggle.closest('tr');
      var position = $toggle.position();
      var top = position.top + $toggle.outerHeight() + 2;
      var left = position.left;
      var $table = this.renderPartial(renderCorrectiveActionsTable, {
        bordered: true,
        correctiveActions: QiResult.serializeCorrectiveActions(
          qiDictionaries,
          this.model.get('changes')[dataset.index].data[dataset.property][dataset.which]
        )
      });

      $table
        .css({
          position: 'absolute',
          top: top + 'px',
          left: left + 'px',
          width: Math.min($parent.outerWidth() - left, 900) + 'px',
          background: '#FFF'
        })
        .appendTo('body');

      this.$lastToggle = $toggle;
      this.$lastTable = $table;
    }

  });
});
