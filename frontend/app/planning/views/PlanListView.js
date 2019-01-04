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

      'planning.settings.updated': function(message)
      {
        if (this.collection.get(message.date))
        {
          this.refreshCollection();
        }
      },

      'planning.generator.finished': function(message)
      {
        if (this.$('.is-empty[data-id="' + message.date + '"]').length)
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
        if (e.currentTarget.classList.contains('is-empty'))
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
      }
    },

    serialize: function()
    {
      var data = ListView.prototype.serialize.apply(this, arguments);
      var to = data.rows[0].moment.clone().subtract(1, 'days');
      var from = to.clone().subtract(6, 'days');

      data.prevLink = '#planning/plans'
        + '?select(mrps._id,mrps.lines._id,mrps.lines.workerCount)'
        + '&_id>=' + from.valueOf() + '&_id<=' + to.valueOf();

      from = data.rows[6].moment.clone().add(1, 'days');
      to = from.clone().add(6, 'days');

      data.nextLink = '#planning/plans'
        + '?select(mrps._id,mrps.lines._id,mrps.lines.workerCount)'
        + '&_id>=' + from.valueOf() + '&_id<=' + to.valueOf();

      return data;
    },

    serializeColumns: function()
    {
      return [];
    },

    serializeRows: function()
    {
      var from = _.find(
        this.collection.rqlQuery.selector.args,
        function(term) { return term.name === 'ge' && term.args[0] === '_id'; }
      ).args[1];
      var daysList = [];
      var daysMap = {};

      for (var i = 0; i < 7; ++i)
      {
        var moment = time.utc.getMoment(from).add(i, 'days');
        var day = {
          moment: moment,
          date: moment.format('YYYY-MM-DD'),
          mrps: []
        };

        daysMap[day.moment.valueOf()] = day;
        daysList.push(day);
      }

      this.collection.forEach(function(planSettings)
      {
        var day = daysMap[Date.parse(planSettings.id)];

        if (!day)
        {
          return;
        }

        planSettings.mrps.forEach(function(mrpSettings)
        {
          day.mrps.push({
            _id: mrpSettings.id,
            lines: mrpSettings.lines.map(function(mrpLineSettings)
            {
              return {
                _id: mrpLineSettings.id
              };
            })
          });
        });
      });

      daysList.forEach(function(day)
      {
        day.mrps.sort(function(a, b) { return a._id.localeCompare(b._id); });
      });

      return daysList;
    }
  });
});
