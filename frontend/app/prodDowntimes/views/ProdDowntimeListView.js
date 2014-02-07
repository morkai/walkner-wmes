define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  './CorroborateProdDowntimeView',
  './decorateProdDowntime'
], function(
  _,
  t,
  user,
  viewport,
  ListView,
  CorroborateProdDowntimeView,
  decorateProdDowntime
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'prodDowntimes.created.*': function(message)
      {
        if (this.collection.hasOrMatches(message))
        {
          this.refreshCollection();
        }
      },
      'prodDowntimes.finished.*': function(message)
      {
        var prodDowntime = this.collection.get(message._id);

        if (prodDowntime)
        {
          prodDowntime.set('finishedAt', new Date(message.finishedAt));
        }
      },
      'prodDowntimes.corroborated.*': function(message)
      {
        if (message._id === this.corroboratingId)
        {
          viewport.closeDialog();
        }

        if (this.collection.hasOrMatches(message))
        {
          this.refreshCollection();
        }
      }
    },

    events: {
      'click .action-corroborate': function(e)
      {
        e.preventDefault();

        var view = this;

        this.broker.subscribe('viewport.dialog.hidden', function()
        {
          view.corroboratingId = null;
        });

        this.corroboratingId = this.$(e.target).closest('tr').attr('data-id');

        viewport.showDialog(
          new CorroborateProdDowntimeView({model: this.collection.get(this.corroboratingId)}),
          t('prodDowntimes', 'corroborate:title')
        );
      }
    },

    columns: [
      'mrpControllers', 'prodFlow', 'aor', 'prodLine', 'reason',
      'startedAt', 'finishedAt', 'duration'
    ],

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.corroboratingId = null;

      this.listenTo(this.collection, 'change', this.render);
    },

    serializeRows: function()
    {
      return this.collection.map(decorateProdDowntime);
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (row.status === 'undecided' && user.isAllowedTo('PROD_DOWNTIMES:MANAGE'))
        {
          actions.push({
            id: 'corroborate',
            icon: 'gavel',
            label: t('prodDowntimes', 'LIST:ACTION:corroborate'),
            href: model.genClientUrl('corroborate')
          });
        }

        return actions;
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$('.is-withReasonComment > td[data-id="reason"]')
        .popover({
          container: this.el,
          trigger: 'hover',
          placement: 'auto right',
          content: function()
          {
            var modelId = view.$(this).closest('tr').attr('data-id');

            return view.collection.get(modelId).get('reasonComment');
          }
        })
        .append('<i class="fa fa-info-circle"></i>')
        .on('shown.bs.popover', function()
        {
          view.$(this).data('bs.popover').$tip.addClass('prodDowntimes-comment');
        });
    }

  });
});
