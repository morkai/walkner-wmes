define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  '../divisions',
  '../subdivisions',
  '../mrpControllers',
  '../prodFlows',
  '../workCenters'
], function(
  _,
  $,
  t,
  View,
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters
) {
  'use strict';

  var ORG_UNIT = {
    DIVISION: 1,
    SUBDIVISION: 2,
    MRP_CONTROLLER: 3,
    PROD_FLOW: 4,
    WORK_CENTER: 5,
    PROD_LINE: 6
  };

  function idAndLabel(model)
  {
    return {id: model.id, text: model.getLabel()};
  }

  return View.extend({

    tagName: 'div',

    className: 'row orgUnitDropdowns',

    initialize: function()
    {
      this.idPrefix = _.uniqueId('orgUnitDropdown');
    },

    serialize: function()
    {
      return {};
    },

    afterRender: function()
    {
      var orgUnit = this.options.orgUnit || ORG_UNIT.DIVISION;

      if (orgUnit >= ORG_UNIT.DIVISION)
      {
        this.renderDivisionDropdown();
      }

      if (orgUnit >= ORG_UNIT.SUBDIVISION)
      {
        this.renderSubdivisionDropdown();
      }

      if (orgUnit >= ORG_UNIT.MRP_CONTROLLER)
      {
        this.renderMrpControllerDropdown();
      }

      if (orgUnit >= ORG_UNIT.PROD_FLOW)
      {
        this.renderProdFlowDropdown();
      }

      if (orgUnit >= ORG_UNIT.WORK_CENTER)
      {
        this.renderWorkCenterDropdown();
      }

      if (orgUnit >= ORG_UNIT.PROD_LINE)
      {
        this.renderProdLineDropdown();
      }
    },

    selectValue: function(model)
    {
      /*jshint -W015*/

      switch (this.options.orgUnit)
      {
        case ORG_UNIT.DIVISION:
          this.selectDivision(model);
          break;

        case ORG_UNIT.SUBDIVISION:
          this.selectSubdivision(model);
          break;

        case ORG_UNIT.MRP_CONTROLLER:
          this.selectMrpController(model);
          break;

        case ORG_UNIT.PROD_FLOW:
          this.selectProdFlow(model);
          break;

        case ORG_UNIT.WORK_CENTER:
          this.selectWorkCenter(model);
          break;

        case ORG_UNIT.PROD_LINE:
          this.selectProdLine(model);
          break;
      }
    },

    selectDivision: function(model)
    {
      return this.selectModel(model, null, divisions, 'division');
    },

    selectSubdivision: function(model)
    {
      return this.selectModel(model, 'selectDivision', subdivisions, 'subdivision');
    },

    selectMrpController: function(model)
    {
      return this.selectModel(model, 'selectSubdivision', mrpControllers, 'mrpController');
    },

    selectProdFlow: function(model)
    {
      throw new Error('TODO');
    },

    selectWorkCenter: function(model)
    {
      throw new Error('TODO');
    },

    selectProdLine: function(model)
    {
      throw new Error('TODO');
    },

    selectModel: function(model, parentSelect, parentCollection, parentProperty)
    {
      if (!model)
      {
        return null;
      }

      var parentModel = parentCollection.get(model.get(parentProperty));

      if (parentSelect !== null)
      {
        parentModel = this[parentSelect](parentModel);
      }

      if (!parentModel)
      {
        return null;
      }

      this.$id(parentProperty)
        .select2('val', parentModel.id)
        .trigger({type: 'change', val: parentModel.id});

      return model;
    },

    createDropdownElement: function(orgUnit)
    {
      var span = Math.floor(12 / this.options.orgUnit);
      var id = this.idPrefix + '-' + orgUnit;
      var html = '<div class="form-group col-lg-' + span + '">'
        + '<label for="' + id + '">' + t('core', 'ORG_UNIT:' + orgUnit) + '</label>'
        + '<input id="' + id + '" name="' + orgUnit + '">'
        + '</div>';

      return $(html).appendTo(this.el).find('input');
    },

    onChange: function($dropdown, collection, parentProperty, e)
    {
      var query = {};
      query[parentProperty] = e.val;

      var data = collection.where(query).map(idAndLabel);
      var options = {
        data: data
      };

      if (parentProperty === 'mrpController')
      {
        options.placeholder = ' ';
        options.allowClear = true;
      }

      $dropdown.select2('val', null);
      $dropdown.select2(options);

      if (data.length)
      {
        $dropdown.select2('val', data[0].id);
      }

      $dropdown.trigger({
        type: 'change',
        val: data.length ? data[0].id : null
      });
    },

    renderDivisionDropdown: function()
    {
      var $dropdown = this.createDropdownElement('division');

      $dropdown.select2({
        data: divisions.map(idAndLabel)
      });
    },

    renderSubdivisionDropdown: function()
    {
      var $dropdown = this.createDropdownElement('subdivision');

      $dropdown.select2({
        data: []
      });

      this.$id('division').on(
        'change', this.onChange.bind(this, $dropdown, subdivisions, 'division')
      );
    },

    renderMrpControllerDropdown: function()
    {
      var $dropdown = this.createDropdownElement('mrpController');

      $dropdown.select2({
        data: []
      });

      this.$id('subdivision').on(
        'change', this.onChange.bind(this, $dropdown, mrpControllers, 'subdivision')
      );
    },

    renderProdFlowDropdown: function()
    {
      var $dropdown = this.createDropdownElement('prodFlow');

      $dropdown.select2({
        data: [],
        allowClear: this.options.orgUnit > ORG_UNIT.PROD_FLOW
      });

      this.$id('mrpController').on(
        'change', this.onChange.bind(this, $dropdown, prodFlows, 'mrpController')
      );
    },

    renderWorkCenterDropdown: function()
    {
      var $dropdown = this.createDropdownElement('workCenter');

      $dropdown.select2({
        data: []
      });

      this.$id('prodFlow').on(
        'change', this.onChange.bind(this, $dropdown, workCenters, 'prodFlow')
      );
      this.$id('mrpController').on(
        'change', this.onChange.bind(this, $dropdown, workCenters, 'mrpController')
      );
    },

    renderProdLineDropdown: function()
    {
      var $dropdown = this.createDropdownElement('prodLine');
    }

  }, {

    ORG_UNIT: ORG_UNIT

  });
});
