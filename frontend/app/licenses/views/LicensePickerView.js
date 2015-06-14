// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/core/View',
  '../LicenseCollection',
  './LicenseListView',
  'app/licenses/templates/picker'
], function(
  $,
  View,
  LicenseCollection,
  LicenseListView,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'licensePicker-dialog',

    template: template,

    events: {
      'click #-unused': function()
      {
        this.model.unused = !this.model.unused;

        this.render();
      },
      'click tr[data-id]': function(e)
      {
        this.trigger('licensePicked', this.licenses.get(e.currentTarget.dataset.id));
      }
    },

    initialize: function()
    {
      this.loading = true;
      this.licenses = new LicenseCollection(null, {
        rqlQuery: 'appId=' + this.model.appId + '&sort(-expireDate)&limit(999)'
      });

      this.model.usedLicenseIds = {};

      var view = this;

      $.when(
        this.licenses.fetch({reset: true}),
        this.model.usedLicenses.fetch({reset: true})
      ).always(function()
      {
        view.loading = false;
        view.model.usedLicenseIds = view.model.usedLicenses.getUsedLicenseIds();

        view.render();
      });
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        unused: this.model.unused,
        loading: false,
        licenses: this.serializeLicenses()
      };
    },

    serializeLicenses: function()
    {
      var licenses = [];

      for (var i = 0; i < this.licenses.length; ++i)
      {
        var license = this.licenses.models[i];

        if (this.model.unused && this.model.usedLicenseIds[license.id])
        {
          continue;
        }

        license = license.serialize();
        license.shortId = license._id.substr(0, 4) + '...' + license._id.substr(-4);

        licenses.push(license);
      }

      return licenses;
    }

  });
});
