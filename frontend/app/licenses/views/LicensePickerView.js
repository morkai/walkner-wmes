// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    getTemplateData: function()
    {
      return {
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
