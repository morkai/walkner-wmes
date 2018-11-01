// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/help/templates/tree',
  'app/help/templates/treeNode'
], function(
  View,
  treeTemplate,
  nodeTemplate
) {
  'use strict';

  return View.extend({

    template: treeTemplate,

    events: {
      'click .help-tree-node-icon': function(e)
      {
        this.model.toggle(this.nodeId(e.target));

        return false;
      },
      'click .help-tree-node-inner': function(e)
      {
        this.model.select(this.nodeId(e.target));

        return false;
      },
      'dblclick .help-tree-node-inner': function(e)
      {
        if (!this.$(e.target).closest('.help-tree-node-icon').length)
        {
          this.model.toggle(this.nodeId(e.target));
        }

        return false;
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'expanded', this.onExpanded);
      this.listenTo(this.model, 'selected', this.onSelected);
    },

    getTemplateData: function()
    {
      return {
        renderNode: nodeTemplate,
        tree: this.model.serializeTree()
      };
    },

    $node: function(el)
    {
      if (typeof el === 'string')
      {
        return this.$('.help-tree-node[data-id="' + el + '"]');
      }

      return this.$(el).closest('.help-tree-node');
    },

    nodeId: function(el)
    {
      return this.$node(el)[0].dataset.id;
    },

    onExpanded: function(id, expanded)
    {
      this.$node(id).toggleClass('is-expanded', expanded);
    },

    onSelected: function(id)
    {
      this.$('.is-selected').removeClass('is-selected');

      this.$node(id).addClass('is-selected');
    }

  });
});
