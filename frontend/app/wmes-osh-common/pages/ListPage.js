// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/templates/list/markAsSeenAction'
], function(
  time,
  viewport,
  FilteredListPage,
  pageActions,
  dictionaries,
  markAsSeenActionTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    nlsDomain: 'wmes-osh-common',

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection, {
          mode: 'id',
          pattern: `^\s*${this.collection.model.RID_PREFIX}?-?([0-9]{4}-)?[0-9]{1,6}$\s*`,
          prepareId: input =>
          {
            const matches = input.trim().match(/([0-9]{4}-)?([0-9]{1,6})$/);
            const year = (matches[1] || time.format(Date.now(), 'YYYY')).replace(/[^0-9]/, '');

            return `${this.collection.model.RID_PREFIX}-${year}-${matches[2].padStart(6, '0')}`;
          }
        }),
        {
          template: () => this.renderPartialHtml(markAsSeenActionTemplate),
          afterRender: $li =>
          {
            $li.find('a[data-filter]').on('click', this.markAsSeen.bind(this));
          }
        },
        pageActions.add(this.collection)
      ];
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    },

    markAsSeen: function(e)
    {
      var page = this;
      var req = page.ajax({
        method: 'POST',
        url: this.collection.genUrl('mark-as-seen'),
        data: JSON.stringify({
          filter: e.currentTarget.dataset.filter
        })
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: page.t('markAsSeen:failure')
        });
      });

      req.done(function(seenIds)
      {
        viewport.msg.show({
          type: 'success',
          time: 2000,
          text: page.t('markAsSeen:success', {count: seenIds.length})
        });
      });
    }

  });
});
