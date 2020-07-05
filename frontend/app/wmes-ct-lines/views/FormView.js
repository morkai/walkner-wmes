// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/orgUnits/util/setUpOrgUnitSelect2',
  'app/wmes-ct-lines/templates/form',
  'app/wmes-ct-lines/templates/inveo/commonForm',
  'app/wmes-ct-lines/templates/inveo/stationForm',
  'app/wmes-ct-lines/templates/luma2/commonForm',
  'app/wmes-ct-lines/templates/luma2/stationForm',
  'app/wmes-ct-lines/templates/balluff/commonForm',
  'app/wmes-ct-lines/templates/balluff/stationForm'
], function(
  _,
  $,
  FormView,
  idAndLabel,
  orgUnits,
  setUpOrgUnitSelect2,
  template,
  inveoCommonForm,
  inveoStationForm,
  luma2CommonForm,
  luma2StationForm,
  balluffCommonForm,
  balluffStationForm
) {
  'use strict';

  var TYPE_TO_TEMPLATES = {
    inveo: {
      common: inveoCommonForm,
      station: inveoStationForm
    },
    luma2: {
      common: luma2CommonForm,
      station: luma2StationForm
    },
    balluff: {
      common: balluffCommonForm,
      station: balluffStationForm
    }
  };

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-addStation': function()
      {
        this.addStation().find('input').first().focus();
        this.recalcStationNo();
      },

      'click .btn[role="moveUp"]': function(e)
      {
        var $station = this.$(e.currentTarget).closest('.panel');
        var $prev = $station.prev();

        if ($prev.length)
        {
          $station.insertBefore($prev);
          this.recalcStationNo();
          e.currentTarget.focus();
        }
      },

      'click .btn[role="moveDown"]': function(e)
      {
        var $station = this.$(e.currentTarget).closest('.panel');
        var $next = $station.next();

        if ($next.length)
        {
          $station.insertAfter($next);
          this.recalcStationNo();
          e.currentTarget.focus();
        }
      },

      'click .btn[role="remove"]': function(e)
      {
        var view = this;

        view.$(e.currentTarget).closest('.panel').fadeOut('fast', function()
        {
          $(this).remove();
          view.recalcStationNo();
        });
      },

      'change input[name="type"]': function()
      {
        this.$id('stations').empty();
        this.renderCommon();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.nextStationIndex = 0;
    },

    afterRender: function()
    {
      var view = this;

      view.renderCommon();

      _.forEach(view.model.get('stations'), function(station)
      {
        view.addStation(view.model.get('type'), station);
      });

      FormView.prototype.afterRender.call(view);

      var $id = view.$id('id');

      if (view.options.editMode)
      {
        $id.prop('readonly', true);
        view.$('input[name="type"]').prop('disabled', true);
        view.$id('active').focus();
      }
      else
      {
        setUpOrgUnitSelect2($id, {
          orgUnitType: 'prodLine',
          itemFilter: function(item)
          {
            var subdivision = orgUnits.getByTypeAndId(
              'subdivision',
              orgUnits.getAllForProdLine(item.model).subdivision
            );

            return subdivision && subdivision.get('type') === 'assembly';
          }
        });

        $id.select2('focus');
      }

      view.recalcStationNo();
    },

    getSelectedType: function()
    {
      return this.$('[name="type"]:checked').val() || this.model.get('type') || 'inveo';
    },

    renderCommon: function()
    {
      var template = TYPE_TO_TEMPLATES[this.getSelectedType()].common;
      var html = this.renderPartialHtml(template);

      this.$id('common').html(html);
    },

    addStation: function(type)
    {
      if (!type)
      {
        type = this.getSelectedType();
      }

      var templates = TYPE_TO_TEMPLATES[type];

      if (!templates)
      {
        throw new Error('Invalid type: ' + type);
      }

      var $station = this.renderPartial(templates.station, {
        idPrefix: this.idPrefix + '-' + this.nextStationIndex,
        stationIndex: this.nextStationIndex
      });

      this.$id('stations').append($station);

      ++this.nextStationIndex;

      return $station;
    },

    recalcStationNo: function()
    {
      var view = this;

      this.$id('stations').find('.panel-heading-title').each(function(i)
      {
        this.innerText = view.t('stations:title', {no: i + 1});
      });
    },

    serializeForm: function(formData)
    {
      if (!Array.isArray(formData.stations))
      {
        formData.stations = this.$id('stations').children().map(function() { return {}; }).get();
      }

      return formData;
    }

  });
});
