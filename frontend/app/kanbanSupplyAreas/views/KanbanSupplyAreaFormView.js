// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/orgUnits',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  '../KanbanSupplyAreaCollection',
  'app/kanbanSupplyAreas/templates/form'
], function(
  _,
  orgUnits,
  idAndLabel,
  FormView,
  KanbanSupplyAreaCollection,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-name, #-workCenter': 'checkUniqueness',

      'click #-addLine': function()
      {
        this.addLine('-');
      },

      'click .btn[data-action="up"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');

        if ($tr.prev().length)
        {
          $tr.insertBefore($tr.prev());

          this.recountLines();
        }
      },

      'click .btn[data-action="down"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');

        if ($tr.next().length)
        {
          $tr.insertAfter($tr.next());

          this.recountLines();
        }
      },

      'click .btn[data-action="remove"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').remove();
        this.recountLines();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.checkUniqueness = _.debounce(this.checkUniqueness.bind(this), 500);

      this.prodLines = [{id: '-', text: this.t('lines:reserved')}].concat(orgUnits.getAllByType('prodLine')
        .filter(function(l) { return !l.get('deactivatedAt'); })
        .map(idAndLabel));
    },

    afterRender: function()
    {
      this.$lineRow = this.$id('lines').children().first().detach();

      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        this.model.get('lines').forEach(this.addLine, this);
      }
      else
      {
        this.addLine('-');
      }

      this.$id('name').focus();
    },

    addLine: function(lineId)
    {
      var $lines = this.$id('lines');
      var $lineRow = this.$lineRow.clone();
      var cells = $lineRow[0].children;

      cells[0].textContent = ($lines[0].childElementCount + 1) + '.';

      $lineRow.find('input').val(lineId).select2({
        data: this.prodLines
      });

      $lines.append($lineRow);
    },

    recountLines: function()
    {
      this.$id('lines').children().each(function(i)
      {
        this.children[0].textContent = (i + 1) + '.';
      });
    },

    serializeForm: function(formData)
    {
      if (!formData.workCenter)
      {
        formData.workCenter = '';
      }

      return formData;
    },

    checkUniqueness: function()
    {
      var view = this;
      var $name = view.$id('name');
      var $workCenter = view.$id('workCenter');
      var url = '/kanban/supplyAreas?select(_id)'
        + '&name=string:' + encodeURIComponent($name.val().trim())
        + '&workCenter=string:' + encodeURIComponent($workCenter.val().trim());

      if (view.model.id)
      {
        url += '&_id=ne=' + view.model.id;
      }

      var req = view.ajax({
        method: 'GET',
        url: url
      });

      $workCenter[0].setCustomValidity(view.t('FORM:ERROR:alreadyExists'));

      req.done(function(res)
      {
        if (res.totalCount === 0)
        {
          $workCenter[0].setCustomValidity('');
        }
      });
    }

  });
});
