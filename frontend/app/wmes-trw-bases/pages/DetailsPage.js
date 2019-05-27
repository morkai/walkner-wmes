// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/pages/DetailsPage',
  'app/wmes-trw-bases/templates/details'
], function(
  $,
  DetailsPage,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,

    pageClassName: 'page-max-flex',

    detailsTemplate: detailsTemplate,

    actions: function()
    {
      return [{
        icon: 'copy',
        label: this.t('PAGE_ACTION:copy'),
        href: '#trw/bases;add?copy=' + this.model.id,
        privileges: 'TRW:MANAGE'
      }].concat(DetailsPage.prototype.actions.apply(this, arguments));
    },

    events: {

      'mouseenter .trw-base-cluster': function(e)
      {
        this.showClusterPopover(e.currentTarget.dataset.id);
      },
      'mouseleave .trw-base-cluster': function()
      {
        this.hideClusterPopover();
      }

    },

    destroy: function()
    {
      this.hideClusterPopover();
    },

    showClusterPopover: function(clusterId)
    {
      this.hideClusterPopover();

      var cluster = this.model.getCluster(clusterId);

      if (!cluster || !cluster.image)
      {
        return;
      }

      this.$clusterPopover = this.$('.trw-base-cluster[data-id="' + clusterId + '"]').popover({
        container: document.body,
        placement: 'top',
        trigger: 'manual',
        html: true,
        content: function()
        {
          return '<img src="' + cluster.image + '">';
        },
        template: function(template)
        {
          return $(template).addClass('trw-base-cluster-popover');
        }
      });

      this.$clusterPopover.popover('show');
    },

    hideClusterPopover: function(clusterId)
    {
      if (!this.$clusterPopover)
      {
        return;
      }

      if (clusterId && this.$clusterPopover[0].dataset.id !== clusterId)
      {
        return;
      }

      this.$clusterPopover.popover('destroy');
      this.$clusterPopover = null;
    }

  });
});
