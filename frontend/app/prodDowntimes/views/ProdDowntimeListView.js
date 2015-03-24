// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  './CorroborateProdDowntimeView'
], function(
  _,
  t,
  user,
  viewport,
  ListView,
  CorroborateProdDowntimeView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable',

    remoteTopics: {
      'prodDowntimes.created.*': 'refreshIfMatches',
      'prodDowntimes.updated.*': 'refreshIfMatches',
      'prodDowntimes.deleted.*': 'refreshIfMatches',
      'prodDowntimes.corroborated.*': function(message)
      {
        if (message._id === this.corroboratingId)
        {
          viewport.closeDialog();
        }
      }
    },

    events: _.extend(ListView.prototype.events, {
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
    }),

    columns: [
      'rid', 'mrpControllers', 'prodFlow', 'aor', 'prodLine', 'reason',
      'startedAt', 'finishedAt', 'duration'
    ],

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.corroboratingId = null;

      this.listenTo(this.collection, 'change', this.render);
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (row.status === 'undecided'
          && user.isAllowedTo('PROD_DOWNTIMES:MANAGE')
          && user.hasAccessToAor(model.get('aor')))
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
    },

    refreshIfMatches: function(message)
    {
      if (this.collection.hasOrMatches(message))
      {
        this.refreshCollection();
      }
    }

  });
});
