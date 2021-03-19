// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  'app/wmes-fap-entries/templates/observers'
], function(
  _,
  View,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change #-observer': function()
      {
        var $observer = this.$id('observer');
        var observer = setUpUserSelect2.getUserInfo($observer);

        $observer.select2('data', null);

        this.addObserver(observer);
      },

      'click a[data-quick-add]': function(e)
      {
        e.preventDefault();

        this.addObserver({
          id: e.currentTarget.dataset.quickAdd,
          label: e.currentTarget.textContent.trim()
        });
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:observers', _.debounce(this.onObserversChanged.bind(this), 1));
        this.listenTo(this.model, 'change:presence', this.onPresenceChanged);
        this.listenTo(this.model, 'change:level', this.toggleMessage);
        this.listenTo(dictionaries.settings, 'change:value', this.onSettingChanged);
      });
    },

    getTemplateData: function()
    {
      return {
        showMessage: this.isMessageVisible(),
        observers: this.model.serializeDetails().observers
      };
    },

    afterRender: function()
    {
      var $observer = this.$id('observer');
      var enabled = this.model.serializeDetails().auth.observers;

      setUpUserSelect2($observer, {
        width: '100%',
        noPersonnelId: true,
        placeholder: this.t('observers:placeholder' + (enabled ? '' : ':auth'))
      });

      if (!enabled)
      {
        $observer.select2('enable', false);
        this.$id('quickAdd').find('.btn').prop('disabled', true);
      }

      this.updateQuickAdd();
    },

    addObserver: function(subscriber)
    {
      var observer = _.some(this.model.get('observers'), function(o) { return o.user.id === subscriber.id; });

      if (!observer)
      {
        var subscribers = [subscriber];

        this.model.change('subscribers', subscribers, null);
      }

      this.timers.focus = setTimeout(this.focusObserver.bind(this, subscriber.id), 1);
    },

    focusObserver: function(id)
    {
      var view = this;
      var $observer = view.$('.fap-observer[data-observer-id="' + id + '"]');

      if (!$observer.length)
      {
        return;
      }

      if ($observer[0].scrollIntoViewIfNeeded)
      {
        $observer[0].scrollIntoViewIfNeeded();
      }
      else
      {
        $observer[0].scrollIntoView();
      }

      view.$('.highlight').removeClass('highlight');

      clearTimeout(this.timers.highlight);

      this.timers.highlight = setTimeout(
        function()
        {
          $observer = view.$('.fap-observer[data-observer-id="' + id + '"]');

          $observer.addClass('highlight');

          view.timers.highlight = setTimeout(function() { $observer.removeClass('highlight'); }, 1100);
        },
        100
      );
    },

    hideUserInfoPopover: function()
    {
      this.$('.userInfoPopover').prev().popover('destroy');
    },

    isMessageVisible: function()
    {
      var details = this.model.serializeDetails();

      return details.level === 0 && details.observers.length === 1;
    },

    toggleMessage: function()
    {
      this.$el.toggleClass('fap-details-panel-message-show', this.isMessageVisible());
    },

    updateQuickAdd: function()
    {
      var observers = {};

      this.model.serializeDetails().observers.forEach(function(o)
      {
        observers[o._id] = true;
      });

      var html = '';

      dictionaries.settings.getValue('quickUsers', []).forEach(function(u)
      {
        if (observers[u.id])
        {
          return;
        }

        html += '<li><a href="#" data-quick-add="' + u.id + '">' + _.escape(u.label) + '</a></li>';
      });

      this.$id('quickAdd').find('ul').html(html);
      this.$id('quickAdd').find('.btn').prop('disabled', !html.length);
    },

    onObserversChanged: function()
    {
      var $new = this.renderPartial(template, {showMessage: false, observers: this.model.serializeObservers()})
        .find('.fap-details-panel-bd');
      var $old = this.$('.fap-details-panel-bd');

      $old.replaceWith($new);

      $new.on('scroll', this.hideUserInfoPopover.bind(this));

      this.toggleMessage();
      this.updateQuickAdd();
    },

    onPresenceChanged: function(entry, presence, options)
    {
      this.$('.fap-observer[data-observer-id="' + options.userId + '"]').toggleClass('fap-is-online', options.online);
    },

    onSettingChanged: function(setting)
    {
      if (/quickUsers$/.test(setting.id))
      {
        this.updateQuickAdd();
      }
    }

  });
});
