// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  'app/mrpControllers/MrpController',
  'app/reports/templates/clip/header'
], function(
  t,
  orgUnits,
  View,
  MrpController,
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
      var orgUnitType = model.get('orgUnitType');
      var orgUnitId = model.get('orgUnitId');
      var orgUnit = orgUnits.getByTypeAndId(orgUnitType, orgUnitId);

      if (!orgUnit && orgUnitType === 'mrpController')
      {
        orgUnit = new MrpController({_id: orgUnitId});
      }

      if (orgUnit)
      {
        do
        {
          var nextOrgUnitType = orgUnits.getType(orgUnit);

          orgUnitPath.unshift({
            label: t('core', 'ORG_UNIT:' + nextOrgUnitType),
            value: [orgUnit.getLabel()],
            query: [
              orgUnitPath.length && nextOrgUnitType !== 'division'
                ? model.serializeToString(nextOrgUnitType, orgUnit.id)
                : null
            ],
            lastI: 0
          });

          if (nextOrgUnitType === 'prodFlow')
          {
            orgUnit = this.serializeMrpControllers(orgUnit, orgUnitPath);
          }

          if (nextOrgUnitType === 'mrpController' && this.parentReport)
          {
            orgUnit = orgUnits.getByTypeAndId('subdivision', this.parentReport.get('parent'));
          }
          else
          {
            orgUnit = orgUnits.getParent(orgUnit);
          }
        }
        while (orgUnit);
      }

      return {
        overallQuery: orgUnitPath.length ? model.serializeToString(null, null) : null,
        orgUnitPath: orgUnitPath,
        fragment: this.displayOptions.serializeToString()
      };
    },

    serializeMrpControllers: function(orgUnit, orgUnitPath)
    {
      var model = this.model;
      var mrpControllerGroup = {
        label: t('core', 'ORG_UNIT:mrpController'),
        value: [],
        query: [],
        lastI: -1
      };

      orgUnit.get('mrpController').forEach(function(mrpControllerId)
      {
        mrpControllerGroup.lastI += 1;
        mrpControllerGroup.value.push(mrpControllerId);
        mrpControllerGroup.query.push(model.serializeToString('mrpController', mrpControllerId));
      });

      orgUnitPath.unshift(mrpControllerGroup);

      return orgUnits.getParent(orgUnit);
    },

    update: function(parentReport)
    {
      this.parentReport = parentReport;
      this.render();
    }

  });
});
