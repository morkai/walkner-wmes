define([
  'underscore',
  'backbone'
], function(
  _,
  Backbone
) {
  'use strict';

  return Backbone.Model.extend({

    idAttribute: '_id',

    urlRoot: '/',

    clientUrlRoot: null,

    nlsDomain: 'core',

    labelProperty: null,

    genClientUrl: function(action)
    {
      if (this.clientUrlRoot === null)
      {
        throw new Error("`clientUrlRoot` was not specified");
      }

      var url = this.clientUrlRoot;

      if (action === 'base')
      {
        return url;
      }

      url += '/';

      if (this.isNew())
      {
        url += encodeURIComponent(this.cid);
      }
      else
      {
        url += encodeURIComponent(this.id);
      }

      if (typeof action === 'string')
      {
        url += ';' + action;
      }

      return url;
    },

    getLabel: function()
    {
      return String(this.get(this.labelProperty || '_id'));
    }

  });
});
