// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-fap-entries/templates/observers'
], function(
  _,
  View,
  setUpUserSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change #-observer': function()
      {
        var $observer = this.$id('observer');
        var subscriber = $observer.select2('data');

        $observer.select2('data', null);

        var observer = _.some(this.model.get('observers'), function(o) { return o.user.id === subscriber.id; });

        if (!observer)
        {
          var subscribers = [{
            id: subscriber.id,
            label: subscriber.text
          }];

          this.model.change('subscribers', subscribers, null);
        }

        this.timers.focus = setTimeout(this.focusObserver.bind(this, subscriber.id), 1);
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:observers', _.debounce(this.onObserversChanged.bind(this), 1));
      this.listenTo(this.model, 'change:presence', this.onPresenceChanged);
      this.listenTo(this.model, 'change:level', this.toggleMessage);
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
      }
    },

    focusObserver: function(id)
    {
      var $observer = this.$('.fap-observer[data-observer-id="' + id + '"]');

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

      this.$('.highlight').removeClass('highlight');

      clearTimeout(this.timers.highlight);

      $observer.addClass('highlight');

      this.timers.highlight = setTimeout(function() { $observer.removeClass('highlight'); }, 1100);
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

    onObserversChanged: function()
    {
      var $new = this.renderPartial(template, {showMessage: false, observers: this.model.serializeObservers()})
        .find('.fap-details-panel-bd');
      var $old = this.$('.fap-details-panel-bd');

      $old.replaceWith($new);

      $new.on('scroll', this.hideUserInfoPopover.bind(this));

      this.toggleMessage();
    },

    onPresenceChanged: function(entry, presence, options)
    {
      this.$('.fap-observer[data-observer-id="' + options.userId + '"]').toggleClass('fap-is-online', options.online);
    }

  });
});
