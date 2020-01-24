// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/planning/templates/list'
], function(
  _,
  time,
  t,
  user,
  ListView,
  template
) {
  'use strict';

  return ListView.extend({

    template: template,

    remoteTopics: {

      'planning.generator.finished': function(message)
      {
        if (this.$('.planning-list-day[data-id="' + message.date + '"]').length)
        {
          this.refreshCollection();
        }
      }

    },

    events: {
      'mousedown .planning-list-day': function(e)
      {
        if (e.button === 1)
        {
          e.preventDefault();
        }
      },
      'mouseup .planning-list-day': function(e)
      {
        if (e.currentTarget.classList.contains('planning-list-notExists'))
        {
          return;
        }

        var url = '#planning/plans/' + e.currentTarget.dataset.id;

        if (e.button === 0)
        {
          window.location.href = url;
        }
        else if (e.button === 1)
        {
          window.open(url);
        }

        return false;
      },
      'click .btn-primary': function(e)
      {
        var $btn = this.$(e.currentTarget).prop('disabled', true);
        var date = $btn.closest('.planning-list-day').attr('data-id');
        var req = this.ajax({
          method: 'POST',
          url: '/planning/plans/' + date + ';generate'
        });

        req.fail(function()
        {
          $btn.prop('disabled', false);
        });
      },
      'click .planning-list-prev': function()
      {
        this.collection.prevMonth();
      },
      'click .planning-list-next': function()
      {
        this.collection.nextMonth();
      }
    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'reset', this.render);
      });
    },

    getTemplateData: function()
    {
      var weekDays = [];
      var moment = time.getMoment().startOf('isoWeek');

      for (var d = 1; d <= 7; ++d)
      {
        weekDays.push(moment.format('dddd'));
        moment.add(1, 'days');
      }

      return {
        canManage: user.isAllowedTo('PLANNING:MANAGE'),
        weekDays: weekDays,
        weeks: _.chunk(this.collection.toJSON(), 7)
      };
    }

  });
});
