// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderDocuments/folders',

    labelAttribute: 'name',

    getLabel: function()
    {
      return (this.get('name') || '').replace(/_/g, ' ');
    },

    isRoot: function()
    {
      return !this.get('parent');
    },

    isInTrash: function()
    {
      return this.get('parent') === '__TRASH__';
    },

    hasAnyChildren: function()
    {
      return !!this.attributes.children && this.attributes.children.length > 0;
    },

    addChildFolder: function(childFolder)
    {
      this.set('children', this.get('children').concat(childFolder.id));
    },

    removeChildFolder: function(childFolder)
    {
      this.set('children', _.without(this.get('children'), childFolder.id));
    }

  });
});
