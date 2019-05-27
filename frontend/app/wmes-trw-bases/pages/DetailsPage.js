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
      var page = this;

      page.hideClusterPopover();

      var cluster = page.model.getCluster(clusterId);

      if (!cluster || !cluster.image)
      {
        return;
      }

      page.$clusterPopover = page.$('.trw-base-cluster[data-id="' + clusterId + '"]').popover({
        container: document.body,
        placement: 'top',
        trigger: 'manual',
        html: true,
        content: function()
        {
          return '<img src="' + cluster.image + '"'
            + ' width="' + image.naturalWidth + '"'
            + ' height="' + image.naturalHeight + '">';
        },
        template: function(template)
        {
          return $(template).addClass('trw-base-cluster-popover');
        }
      });

      var image = new Image();

      image.onload = function()
      {
        if (page.$clusterPopover && page.$clusterPopover[0].dataset.id === clusterId)
        {
          page.$clusterPopover.popover('show');
        }
      };

      image.src = cluster.image;
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
