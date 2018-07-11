// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/orgUnits',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/kanbanSupplyAreas/templates/form'
], function(
  _,
  orgUnits,
  idAndLabel,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-_id': 'validateId',

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

      this.validateId = _.debounce(this.validateId.bind(this), 500);

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
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }
      else
      {
        this.addLine('-');
        this.$id('_id').focus();
      }
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

    validateId: function()
    {
      var view = this;
      var $id = view.$id('_id');
      var req = view.ajax({method: 'HEAD', url: '/kanban/supplyAreas/' + $id.val()});

      req.fail(function()
      {
        $id[0].setCustomValidity('');
      });

      req.done(function()
      {
        $id[0].setCustomValidity(req.status === 200 ? view.t('FORM:ERROR:alreadyExists') : '');
      });
    }

  });
});
