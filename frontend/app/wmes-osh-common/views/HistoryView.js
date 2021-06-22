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
  'app/core/util/html',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/templates/history/panel',
  'app/wmes-osh-common/templates/history/item',
  'app/wmes-osh-common/templates/history/observationPopover'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  html,
  dictionaries,
  template,
  itemTemplate,
  observationPopoverTemplate
) {
  'use strict';

  const IGNORED_PROPS = {
    statusComment: true,
    statusUpdater: true,
    startedAt: true,
    implementedAt: true,
    finishedAt: true
  };

  return View.extend({

    nlsDomain: 'wmes-osh-common',

    template,

    events: {

      'click #-commentsOnly': function()
      {
        this.commentsOnly = !this.commentsOnly;

        if (this.commentsOnly)
        {
          localStorage.setItem('OSH_HISTORY_COMMENTS_ONLY', '1');
        }
        else
        {
          localStorage.removeItem('OSH_HISTORY_COMMENTS_ONLY');
        }

        this.render();

        if (this.commentsOnly)
        {
          this.scrollToBottom();
          this.scrollIntoView();
        }
      },

      'click #-maximize': function()
      {
        if (this.commentsOnly)
        {
          this.scrollToBottom();
        }

        this.scrollIntoView();
      },

      'keyup #-comment': function(e)
      {
        if (e.ctrlKey && e.key === 'Enter')
        {
          this.$id('submit').click();

          return false;
        }
      },

      'submit form': function()
      {
        const $submit = this.$id('submit');
        const $comment = this.$id('comment');
        const comment = $comment.val().trim();

        this.scrollIntoView();

        if (!comment.replace(/[^a-zA-Z0-9]+/g, '').length)
        {
          $comment.val('').focus();

          return false;
        }

        $submit.prop('disabled', true);
        $comment.prop('disabled', true);

        const req = this.ajax({
          method: 'PUT',
          url: this.model.url(),
          data: JSON.stringify({
            comment
          })
        });

        req.fail(() => viewport.msg.savingFailed());

        req.done(() =>
        {
          viewport.msg.saved();

          $comment.val('');
        });

        req.always(() =>
        {
          $submit.prop('disabled', false);
          $comment.prop('disabled', false).focus();
        });

        return false;
      }

    },

    initialize: function()
    {
      this.commentsOnly = localStorage.getItem('OSH_HISTORY_COMMENTS_ONLY') === '1';

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:changes', _.debounce(this.updateHistory, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });

      $(window).on(`resize.${this.idPrefix}`, _.debounce(this.resize.bind(this), 33));
    },

    getTemplateData: function()
    {
      return {
        renderItem: this.renderPartialHtml.bind(this, itemTemplate),
        items: this.serializeItems(),
        canComment: this.model.constructor.can.comment(this.model),
        commentsOnly: this.commentsOnly,
        maxHeight: this.calcHeight()
      };
    },

    serializeItems: function()
    {
      return this.model.get('changes')
        .map(this.serializeItem, this)
        .filter(this.filterItem, this);
    },

    filterItem: function(item)
    {
      if (this.commentsOnly && !item.comment)
      {
        return false;
      }

      return !!item.comment || !!item.changes.length;
    },

    serializeItem: function(change, changeIndex)
    {
      const observer = this.model.getObserver();
      const changedAt = Date.parse(change.date);
      const unseen = observer.notify && observer.lastSeenAt < changedAt;
      const changes = this.commentsOnly ? [] : _.map(change.data, (values, property) =>
      {
        if (IGNORED_PROPS[property])
        {
          return null;
        }

        const label = this.translateProperty(property);

        if (this.diff[property])
        {
          values = this.diff[property](values[0], values[1]);
        }

        if (values[0] === null && values[1] && (values[1].added || values[1].edited || values[1].deleted))
        {
          return {
            label,
            values: this.serializeItemValues(property, values[1], changeIndex)
          };
        }

        return {
          label,
          oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
          newValue: this.serializeItemValue(property, values[1], false, changeIndex)
        };
      }).filter(change => !!change);

      return {
        i: changeIndex,
        time: time.toTagData(changedAt),
        user: userInfoTemplate(change.user, {noIp: true}),
        changes,
        comment: change.comment.trim(),
        unseen
      };
    },

    translate: function(key, data)
    {
      const modelDomain = this.model.getNlsDomain();

      if (this.t.has(modelDomain, key))
      {
        return this.t(modelDomain, key, data);
      }

      return this.t(key, data);
    },

    translateProperty: function(property)
    {
      const modelDomain = this.model.getNlsDomain();

      if (this.t.has(modelDomain, `history:${property}`))
      {
        return this.t(modelDomain, `history:${property}`);
      }

      if (this.t.has(`history:${property}`))
      {
        return this.t(`history:${property}`);
      }

      return this.translate(`PROPERTY:${property}`);
    },

    serializeItemValue: function(property, value, isOld, changeI)
    {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0))
      {
        return '-';
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
        case 'implementer':
        case 'implementers':
        case 'coordinators':
          return userInfoTemplate(value);

        case 'plannedAt':
          return time.utc.format(value, 'LL');

        case 'date':
        case 'eventDate':
          return time.utc.format(value, this.translate(`details:${property}:format`));

        case 'problem':
        case 'reason':
        case 'suggestion':
        case 'solution':
        case 'companyName':
        case 'description':
          return value.length <= 43 ? value : {
            more: value,
            toString: () => `${value.substr(0, 40)}...`
          };

        case 'priority':
        case 'status':
        case 'kind':
        case 'division':
        case 'workplace':
        case 'department':
        case 'building':
        case 'location':
        case 'station':
        case 'eventCategory':
        case 'reasonCategory':
        case 'company':
        case 'activityKind':
        {
          const long = _.escape(dictionaries.getLabel(property, value, {long: true}));
          const short = _.escape(dictionaries.getLabel(property, value, {long: false}));

          if (long > 43)
          {
            if (short > 43)
            {
              return {
                more: long,
                toString: () => `${long.substr(0, 40)}...`
              };
            }

            return {
              more: long,
              toString: () => short
            };
          }

          return long;
        }

        case 'attachments':
        {
          const a = `<a href="${this.model.getAttachmentUrl(value)}&change=${changeI}" target="_blank">`;
          let kind = '';

          if (value.kind && this.t.has(`history:attachmentKind:${value.kind}`))
          {
            kind = ' (' + this.t(`history:attachmentKind:${value.kind}`) + ')';
          }

          if (value.name.length <= 43)
          {
            return `${a}${_.escape(value.name)}</a>${kind}`;
          }

          return {
            more: value.name,
            toString: () => `${a}${_.escape(value.name).substr(0, 40)}...</a>${kind}`
          };
        }

        case 'relations':
        case 'resolutions':
        {
          return this.translate(`relation:${value.type}`, value);
        }

        case 'resolution':
        {
          if (value._id)
          {
            return this.translate(`resolution:link:${value.type}`, value);
          }

          return this.translate(`resolution:desc:${value.type}`);
        }

        case 'rootCauses':
        {
          const label = dictionaries.getLabel('rootCauseCategory', value.category).toLocaleLowerCase();

          if (!value.why.length)
          {
            return `${label} (0)`;
          }

          return html.tag('span', {
            className: 'has-more',
            data: {
              change: changeI,
              value: isOld ? 0 : 1,
              property,
              category: value.category
            }
          }, `${label} (${value.why.length})`);
        }

        case 'behaviors':
        case 'workConditions':
        {
          if (isOld)
          {
            return null;
          }

          const label = dictionaries.getLabel('observationCategories', value.category);

          return html.tag('span', {
            className: 'has-more',
            data: {
              change: changeI,
              old: isOld ? 1 : 0,
              property,
              observation: value._id
            }
          }, label.length <= 43 ? label : `${label.substring(0, 40)}...`);
        }

        case 'kom':
          return this.t(`kom:${value}`);

        case 'reward':
          return dictionaries.currencyFormatter.format(value);

        default:
          if (value === 0)
          {
            return '0';
          }

          return value || '';
      }
    },

    serializeItemValues: function(property, {added, edited, deleted}, changeIndex)
    {
      const values = [];

      if (property === 'behaviors' || property === 'workConditions')
      {
        (deleted || []).forEach(value => values.push({
          icon: 'fa-times',
          oldValue: null,
          newValue: this.serializeItemValue(property, value, false, changeIndex)
        }));

        (added || []).forEach(value => values.push({
          icon: 'fa-plus',
          oldValue: null,
          newValue: this.serializeItemValue(property, value, false, changeIndex)
        }));

        (edited || []).forEach(value => values.push({
          icon: 'fa-pencil',
          oldValue: null,
          newValue: this.serializeItemValue(property, value, false, changeIndex)
        }));
      }
      else
      {
        (deleted || []).forEach(value => values.push({
          oldValue: this.serializeItemValue(property, value, true, changeIndex),
          newValue: '-'
        }));

        (added || []).forEach(value => values.push({
          oldValue: '-',
          newValue: this.serializeItemValue(property, value, false, changeIndex)
        }));

        (edited || []).forEach(value => values.push({
          oldValue: this.serializeItemValue(property, Object.assign({}, value, value.old), true, changeIndex),
          newValue: this.serializeItemValue(property, value, false, changeIndex)
        }));
      }

      return values;
    },

    serializeRootCausesPopover: function(changeI, valueI, categoryId)
    {
      const change = this.model.get('changes')[changeI];

      if (!change || !change.data.rootCauses)
      {
        return;
      }

      const rootCauses = change.data.rootCauses[valueI];

      if (!rootCauses || !rootCauses.length)
      {
        return;
      }

      const rootCause = rootCauses.find(rootCause => rootCause.category === categoryId);

      if (!rootCause)
      {
        return;
      }

      return '<ol><li>'
        + rootCause.why.filter(why => !!why).map(why => _.escape(why)).join('<li>')
        + '</ol>';
    },

    serializeObservationPopover: function(property, changeI, isOld, observationId)
    {
      const change = this.model.get('changes')[changeI];

      if (!change || !change.data[property])
      {
        return;
      }

      const {added, edited, deleted} = change.data[property][1];

      const o = deleted.find(o => o._id === observationId)
        || added.find(o => o._id === observationId)
        || edited.find(o => o._id === observationId);

      if (!o)
      {
        return;
      }

      return this.renderPartialHtml(observationPopoverTemplate, {
        p: this.translateProperty.bind(this),
        property,
        o
      });
    },

    afterRender: function()
    {
      const view = this;

      view.lastChangeCount = view.model.get('changes').length;

      view.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        className: 'osh-history-popover',
        html: true,
        title: function()
        {
          switch (this.dataset.property)
          {
            case 'rootCauses':
              return dictionaries.getLabel('rootCauseCategories', +this.dataset.category, {long: true});

            case 'behaviors':
            case 'workConditions':
              return '';

            default:
              return $(this).closest('tr').children().first().text();
          }
        },
        content: function()
        {
          const dataset = this.dataset;
          const property = dataset.property;

          switch (this.dataset.property)
          {
            case 'rootCauses':
              return view.serializeRootCausesPopover(
                +dataset.change,
                +dataset.value,
                +dataset.category
              );

            case 'behaviors':
            case 'workConditions':
              return view.serializeObservationPopover(
                property,
                +dataset.change,
                dataset.old === '1',
                dataset.observation
              );

            default:
              return `<p>${_.escape(this.title)}</p>`;
          }
        }
      });

      if (!view.timers.updateTimes)
      {
        view.timers.updateTimes = setInterval(view.updateTimes.bind(view), 30000);
      }

      view.resize();
      view.scrollToBottom();
    },

    updateHistory: function()
    {
      const changes = this.model.get('changes');
      let html = '';

      for (let i = this.lastChangeCount; i < changes.length; ++i)
      {
        const item = this.serializeItem(changes[i], i);

        if (this.filterItem(item))
        {
          html += this.renderPartialHtml(itemTemplate, {
            item
          });
        }
      }

      if (html.length)
      {
        const $items = this.$id('items');
        const $item = $(html);
        const scrollToBottom = $items[0].scrollTop + $items.outerHeight() >= $items[0].scrollHeight;

        $items.append($item);

        if (scrollToBottom)
        {
          this.scrollToBottom();
        }

        $item.addClass('highlight');
      }

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.osh-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 3 ? tagData.long : tagData.human;
      });
    },

    calcHeight: function()
    {
      const $heading = this.$('.panel-heading');
      const $footer = this.$id('.panel-footer');

      return window.innerHeight - ($heading.outerHeight() || 41) - ($footer.outerHeight() || 139) - 30;
    },

    resize: function()
    {
      this.$id('items').css('max-height', this.calcHeight() + 'px');
    },

    scrollToBottom: function()
    {
      const $items = this.$id('items');

      $items[0].scrollTop = $items[0].scrollHeight;
    },

    scrollIntoView: function()
    {
      document.scrollingElement.scrollTop = this.el.offsetTop - 15;
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    },

    diff: {

      rootCauses: (oldRootCauses, newRootCauses) =>
      {
        const oldMap = new Map();
        const newMap = new Map();

        (oldRootCauses || []).forEach(rootCause =>
        {
          oldMap.set(rootCause.category, rootCause.why.filter(why => !!why));
        });

        (newRootCauses || []).forEach(rootCause =>
        {
          newMap.set(rootCause.category, rootCause.why.filter(why => !!why));
        });

        const added = [];
        const edited = [];
        const deleted = [];

        oldMap.forEach((oldWhy, category) =>
        {
          const newWhy = newMap.get(category);

          delete newMap.delete(category);

          if (!newWhy)
          {
            deleted.push({category, why: oldWhy});

            return;
          }

          if (JSON.stringify(oldWhy) !== JSON.stringify(newWhy))
          {
            edited.push({
              category,
              why: newWhy,
              old: {
                category,
                why: oldWhy
              }
            });
          }
        });

        newMap.forEach((why, category) =>
        {
          added.push({
            category,
            why
          });
        });

        return [null, {
          added,
          edited,
          deleted
        }];
      }

    }

  });
});
