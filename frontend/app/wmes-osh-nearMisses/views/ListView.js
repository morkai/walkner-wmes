// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/ListView'
], function(
  viewport,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    events: Object.assign({

      'click .action-seen': function(e)
      {
        const $action = this.$(e.target).closest('.action-seen').prop('disabled', true);
        const $row = $action.closest('.list-item').removeClass('osh-unseen');

        const req = this.ajax({
          method: 'POST',
          url: '/osh/nearMisses;mark-as-seen',
          data: JSON.stringify({
            filter: [+$row[0].dataset.id]
          })
        });

        req.fail(() =>
        {
          viewport.msg.show({
            type: 'error',
            time: 2000,
            text: this.t('markAsSeen:failure')
          });

          $row.addClass('osh-unseen');
          $action.prop('disabled', false);
        });
      }

    }, ListView.prototype.events),

    localTopics: function()
    {
      return {
        [`${this.collection.getTopicPrefix()}.seen.*`]: 'onSeen'
      };
    },

    serializeColumns: function()
    {
      return [
        {
          id: '_id',
          min: 1,
          thClassName: 'is-filter',
          tdClassName: 'is-number'
        },
        {
          id: 'status',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'createdAt',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'creator',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'workplace',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'division',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'building',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'location',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'eventDate',
          min: 1
        },
        {
          id: 'kind',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'eventCategory',
          className: 'is-overflow w175',
          thClassName: 'is-filter'
        },
        {
          id: 'reasonCategory',
          className: 'is-overflow w175',
          thClassName: 'is-filter'
        },
        {
          id: 'subject',
          className: 'is-overflow w200'
        },
        {
          id: 'implementer',
          min: 1,
          thClassName: 'is-filter'
        },
        '-'
      ];
    },

    serializeActions: function()
    {
      const Model = this.collection.model;

      return row =>
      {
        const model = this.collection.get(row._id);

        return [
          {
            id: 'seen',
            icon: 'eye',
            label: this.t('markAsSeen:listAction'),
            className: row.unseen ? '' : 'disabled'
          },
          ListView.actions.viewDetails(model),
          Object.assign(ListView.actions.edit(model), {
            className: Model.can.edit(model) ? '' : 'disabled'
          }),
          Object.assign(ListView.actions.delete(model), {
            className: Model.can.delete(model) ? '' : 'disabled'
          })
        ];
      };
    },

    onSeen: function({ids})
    {
      ids.forEach(id =>
      {
        const model = this.collection.get(id);

        if (model)
        {
          model.handleSeen();

          this.$row(id)
            .removeClass('osh-unseen')
            .find('.action-seen')
            .prop('disabled', true);
        }
      });
    }

  });
});
