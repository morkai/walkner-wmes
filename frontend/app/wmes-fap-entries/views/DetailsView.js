// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/delayReasons',
  'app/data/orgUnits',
  './ChatView',
  './ObserversView',
  './AttachmentsView',
  './AnalysisView',
  'app/wmes-fap-entries/templates/details'
], function(
  _,
  $,
  View,
  idAndLabel,
  delayReasons,
  orgUnits,
  ChatView,
  ObserversView,
  AttachmentsView,
  AnalysisView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .fap-editable-toggle': function(e)
      {
        var $prop = this.$(e.target).closest('.fap-prop');

        this.showEditor($prop, $prop[0].dataset.prop);
      }

    },

    initialize: function()
    {
      var view = this;

      view.setView('#-chat', new ChatView({model: view.model}));
      view.insertView('#-observersAndAttachments', new ObserversView({model: view.model}));
      view.insertView('#-observersAndAttachments', new AttachmentsView({model: view.model}));
      view.setView('#-analysis', new AnalysisView({model: view.model}));

      view.listenTo(view.model, 'change:status', view.updateStatus);
      view.listenTo(view.model, 'change:problem', view.updateProblem);
      view.listenTo(view.model, 'change:category', view.updateCategory);
      view.listenTo(view.model, 'change:lines', view.updateLines);

      $(window).on('keydown.' + view.idPrefix, view.onKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        model: this.model.serializeDetails()
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$('.fap-prop.fap-is-editable').each(function()
      {
        view.setUpEditable(view.$(this), this.dataset.prop);
      });
    },

    updateStatus: function()
    {
      this.$id('status').text(this.model.get('status'));
    },

    updateProblem: function()
    {
      var details = this.model.serializeDetails();
      var $prop = this.$('.fap-prop[data-prop="problem"]');

      $prop.toggleClass('fap-multiline', details.multilineProblem);
      $prop.find('.fap-prop-value').text(details.problem);
    },

    updateCategory: function()
    {
      this.$('.fap-prop[data-prop="category"]').find('.fap-prop-value').text(this.model.serializeDetails().category);
    },

    updateLines: function()
    {
      this.$('.fap-prop[data-prop="lines"]').find('.fap-prop-value').text(this.model.serializeDetails().lines);
    },

    setUpEditable: function($prop)
    {
      $prop.find('.fap-prop-name').append('<i class="fa fa-edit fap-editable-toggle"></i>');
    },

    showEditor: function($prop, prop)
    {
      this.hideEditor();

      if (this.editors[prop])
      {
        $prop.addClass('fap-is-editing');

        this.editors[prop].call(this, $prop, prop);
      }
    },

    hideEditor: function()
    {
      var view = this;
      var $editor = view.$('.fap-editor');

      $editor.find('.select2-container').each(function()
      {
        view.$(this.nextElementSibling).select2('destroy');
      });

      $editor.remove();

      view.$('.fap-is-editing').removeClass('fap-is-editing');
    },

    onKeyDown: function(e)
    {
      if (e.originalEvent.key === 'Escape')
      {
        this.hideEditor();
      }
    },

    editors: {

      problem: function($prop)
      {
        var view = this;
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<textarea class="form-control"></textarea>').val(view.model.get('problem'));
        var $submit = $('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var value = $value.val().trim();

          if (value === '' || value === view.model.get('problem'))
          {
            return view.hideEditor();
          }

          view.model.change('problem', value);

          view.hideEditor();

          return false;
        });

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();
      },

      category: function($prop)
      {
        var view = this;
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<select class="form-control"></select>');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var value = $value.val();

          if (value === view.model.get('category'))
          {
            return view.hideEditor();
          }

          view.model.change('category', value);

          view.hideEditor();

          return false;
        });

        $value.html(delayReasons.map(function(dr)
        {
          return '<option value="' + dr.id + '">' + _.escape(dr.getLabel()) + '</option>';
        }).join(''));

        $value.val(view.model.get('category'));

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();
      },

      lines: function($prop)
      {
        var view = this;
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<input>');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = $value.val().split(',').sort(sort);
          var oldValue = view.model.get('lines').sort(sort);

          if (newValue.length === 0 || JSON.stringify(newValue) === JSON.stringify(oldValue))
          {
            return view.hideEditor();
          }

          view.model.change('lines', newValue);

          view.hideEditor();

          return false;
        });

        $value.val(view.model.get('lines').join(','));

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.select2({
          width: '100%',
          multiple: true,
          allowClear: true,
          placeholder: ' ',
          data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
        });

        $value.focus();

        function sort(a, b)
        {
          return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
        }
      }

    }

  });
});
