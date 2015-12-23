// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  'app/reports/templates/5/header'
], function(
  t,
  orgUnits,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.displayOptions, 'change', this.render);
    },

    serialize: function()
    {
      var model = this.model;
      var orgUnitPath = [];
      var orgUnit = orgUnits.getByTypeAndId(model.get('orgUnitType'), model.get('orgUnitId'));

      if (orgUnit)
      {
        do
        {
          var orgUnitType = orgUnits.getType(orgUnit);

          orgUnitPath.unshift({
            label: t('core', 'ORG_UNIT:' + orgUnitType),
            value: [orgUnit.getLabel()],
            query: [orgUnitPath.length ? model.serializeToString(orgUnitType, orgUnit.id) : null],
            lastI: 0
          });

          orgUnit = orgUnits.getParent(orgUnit);
        }
        while (orgUnit);
      }

      return {
        overallQuery: orgUnitPath.length ? model.serializeToString(null, null) : null,
        orgUnitPath: orgUnitPath,
        fragment: this.displayOptions.serializeToString()
      };
    }

  });
});
