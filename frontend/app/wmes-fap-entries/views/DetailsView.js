// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  '../dictionaries',
  '../Entry',
  './ChatView',
  './ObserversView',
  './AttachmentsView',
  'app/wmes-fap-entries/templates/details'
], function(
  _,
  $,
  View,
  idAndLabel,
  orgUnits,
  dictionaries,
  Entry,
  ChatView,
  ObserversView,
  AttachmentsView,
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
      var entry = view.model;

      view.setView('#-chat', new ChatView({model: entry}));
      view.insertView('#-observersAndAttachments', new ObserversView({model: entry}));
      view.insertView('#-observersAndAttachments', new AttachmentsView({model: entry}));

      view.listenTo(entry, 'change', view.update);
      view.listenTo(entry, 'editor:show', view.showEditor);
      view.listenTo(entry, 'editor:hide', view.hideEditor);

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
      this.updateAuth();
    },

    update: function()
    {
      var view = this;

      if (!view.isRendered())
      {
        return;
      }

      Object.keys(view.model.changed).forEach(function(prop)
      {
        if (Entry.AUTH_PROPS[prop])
        {
          cancelAnimationFrame(view.timers.auth);

          view.timers.auth = requestAnimationFrame(view.updateAuth.bind(view));
        }

        var updater = view.resolveUpdater(prop);

        if (!updater)
        {
          return;
        }

        cancelAnimationFrame(view.timers[prop]);

        view.timers[prop] = requestAnimationFrame(updater.bind(view));
      });
    },

    resolveUpdater: function(prop)
    {
      switch (prop)
      {
        case 'status':
          return this.updateMessage;

        case 'why5':
          return this.updateWhy5;

        case 'analysisNeed':
        case 'analysisDone':
          return this.updateAnalysis;

        case 'problem':
        case 'solution':
          return this.updateMultiline.bind(this, prop);

        case 'category':
        case 'divisions':
        case 'lines':
        case 'assessment':
          return this.updateProp.bind(this, prop);
      }
    },

    updateAuth: function()
    {
      var view = this;

      if (!view.isRendered())
      {
        return;
      }

      var details = view.model.serializeDetails();

      Object.keys(details.auth).forEach(function(prop)
      {
        var $prop = view.$('.fap-prop[data-prop="' + prop + '"]');

        if (!$prop.length)
        {
          return;
        }

        $prop.toggleClass('fap-is-editable', details.auth[prop]);

        var $toggle = $prop.find('.fap-editable-toggle');

        if (!$toggle.length)
        {
          $prop.find('.fap-prop-name').append('<i class="fa fa-edit fap-editable-toggle"></i>');
        }
      });
    },

    updateText: function($prop, text)
    {
      var el = $prop instanceof $ ? $prop.find('.fap-prop-value')[0] : $prop;

      if (el.hasChildNodes())
      {
        if (el.childNodes[0].nodeType === Node.TEXT_NODE)
        {
          el = el.childNodes[0];
        }
        else
        {
          el = el.insertBefore(document.createTextNode(text), el);
        }
      }

      el.textContent = text;
    },

    updateProp: function(prop)
    {
      this.updateText(this.$('.fap-prop[data-prop="' + prop + '"]'), this.model.serializeDetails()[prop]);
    },

    updateMessage: function()
    {
      var details = this.model.serializeDetails();

      this.$id('message')
        .attr('class', 'message message-inline message-' + details.message.type)
        .text(details.message.text);
    },

    updateMultiline: function(prop)
    {
      var details = this.model.serializeDetails();
      var $prop = this.$('.fap-prop[data-prop="' + prop + '"]');

      $prop.toggleClass('fap-is-multiline', details[prop + 'Multiline']);

      this.updateText($prop, details[prop]);
    },

    updateWhy5: function()
    {
      var view = this;
      var why5 = view.model.get('why5');

      view.$('.fap-analysis-why-value').each(function(i)
      {
        view.updateText(this, why5[i] || '');
      });
    },

    updateAnalysis: function()
    {
      this.updateProp('analysisNeed');
      this.updateProp('analysisDone');
      this.updateMessage();
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

      textArea: function($prop, required)
      {
        var view = this;
        var prop = $prop[0].dataset.prop;
        var oldValue = view.model.get(prop);
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<textarea class="form-control"></textarea>').val(oldValue).prop('required', required);
        var $submit = $('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = $value.val().trim();

          if (newValue !== oldValue)
          {
            view.model.change(prop, newValue);
          }

          view.hideEditor();

          return false;
        });

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();

        if ($submit[0].scrollIntoViewIfNeeded)
        {
          $submit[0].scrollIntoViewIfNeeded();
        }
        else
        {
          $submit[0].scrollIntoView();
        }
      },

      problem: function($prop)
      {
        this.editors.textArea.call(this, $prop, true);
      },

      solution: function($prop)
      {
        this.editors.textArea.call(this, $prop, false);
      },

      category: function($prop)
      {
        var view = this;
        var oldValue = view.model.get('category');
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<select class="form-control"></select>');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = $value.val();

          if (newValue !== oldValue)
          {
            view.model.change('category', newValue);
          }

          view.hideEditor();

          return false;
        });

        var categories = dictionaries.categories
          .filter(function(c)
          {
            return c.id === oldValue || c.get('active');
          })
          .map(function(c)
          {
            return '<option value="' + c.id + '">' + _.escape(c.getLabel()) + '</option>';
          });

        $value.html(categories.join(''));

        $value.val(oldValue);

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();
      },

      lines: function($prop)
      {
        var view = this;
        var oldValue = {
          divisions: [].concat(view.model.get('divisions')).sort(sort),
          lines: [].concat(view.model.get('lines')).sort(sort)
        };
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<input>');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = {
            divisions: [],
            lines: $value.val().split(',').sort(sort)
          };

          newValue.lines.forEach(function(line)
          {
            var division = orgUnits.getAllForProdLine(line).division;

            if (division && newValue.divisions.indexOf(division) === -1)
            {
              newValue.divisions.push(division);
            }
          });

          newValue.divisions.sort(sort);

          if (newValue.lines.length > 0 && JSON.stringify(newValue) !== JSON.stringify(oldValue))
          {
            view.model.multiChange(newValue);
          }

          view.hideEditor();

          return false;
        });

        $value.val(oldValue.lines.join(','));

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
      },

      why5: function($prop)
      {
        var view = this;
        var oldValues = [].concat(view.model.get('why5'));

        $prop.find('.fap-analysis-why').each(function(i)
        {
          var $why = view.$(this);
          var $form = $('<form class="fap-editor"></form>');
          var $value = $('<input class="form-control">').val(oldValues[i] || '');
          var $submit = $('<button class="btn btn-primary" tabindex="-1"><i class="fa fa-check"></i></button>');

          $form.on('submit', function()
          {
            submit();

            return false;
          });

          $form
            .append($value)
            .append($submit)
            .appendTo($why.find('.fap-analysis-why-value'));
        });

        $prop.find('.form-control').first().focus();

        function submit()
        {
          var newValues = $prop.find('.form-control').map(function() { return this.value.trim(); }).get();
          var currentValues = view.model.get('why5');
          var why5 = [];
          var changed = false;

          newValues.forEach(function(newValue, i)
          {
            var oldValue = oldValues[i] || '';

            if (newValue === oldValue)
            {
              why5.push(currentValues[i] || '');
            }
            else
            {
              why5.push(newValue);

              changed = true;
            }
          });

          if (changed)
          {
            view.model.change('why5', why5);
          }

          view.hideEditor();

          return false;
        }
      },

      assessment: function($prop)
      {
        var view = this;
        var oldValue = this.model.get('assessment');
        var $form = $('<form class="fap-editor"></form>');

        ['unspecified', 'effective', 'ineffective', 'repeatable'].forEach(function(option)
        {
          $('<button type="button" class="btn btn-lg btn-default"></button>')
            .toggleClass('active', oldValue === option)
            .val(option)
            .text(view.t('assessment:' + option))
            .appendTo($form);
        });

        $form.on('click', '.btn', function(e)
        {
          var newValue = e.currentTarget.value;

          if (newValue !== oldValue)
          {
            view.model.change('assessment', newValue);
          }

          view.hideEditor();
        });

        $form.appendTo($prop.find('.fap-prop-value'));
      },

      yesNo: function($prop, prepareData)
      {
        var view = this;
        var prop = $prop[0].dataset.prop;
        var oldValue = this.model.get(prop);
        var $form = $('<form class="fap-editor fap-editor-yesNo"></form>');

        ['true', 'false'].forEach(function(option)
        {
          $('<button type="button" class="btn btn-lg btn-default"></button>')
            .toggleClass('active', String(oldValue) === option)
            .val(option)
            .text(view.t('core', 'BOOL:' + option))
            .appendTo($form);
        });

        $form.on('click', '.btn', function(e)
        {
          var newValue = e.currentTarget.value === 'true';

          if (newValue !== oldValue)
          {
            if (prepareData)
            {
              view.model.multiChange(prepareData(newValue, oldValue, prop, $prop));
            }
            else
            {
              view.model.change(prop, newValue);
            }
          }

          view.hideEditor();
        });

        $form.appendTo($prop.find('.fap-prop-value'));
      },

      analysisNeed: function($prop)
      {
        this.editors.yesNo.call(this, $prop, function(newValue)
        {
          // TODO Reset Why and Solution?
          return {
            analysisNeed: newValue,
            analysisDone: false
          };
        });
      },

      analysisDone: function($prop)
      {
        this.editors.yesNo.call(this, $prop);
      },

      attachment: function($attachment)
      {
        var view = this;
        var id = $attachment[0].dataset.attachmentId;
        var oldValue = _.findWhere(view.model.get('attachments'), {_id: id});
        var rect = $attachment[0].getBoundingClientRect();
        var $form = $('<form class="fap-editor fap-attachments-editor"></form>').css({
          top: $attachment.offset().top + 'px',
          left: rect.left + 'px',
          width: rect.width + 'px'
        });
        var $value = $('<input class="form-control" type="text">')
          .prop('id', this.idPrefix + '-attachmentEditor')
          .val(oldValue.name);
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = JSON.parse(JSON.stringify(oldValue));

          newValue.name = $value.val().trim();

          var ext = oldValue.name.split('.').pop();
          var re = new RegExp('\\.' + ext + '$', 'i');

          if (!re.test(newValue.name))
          {
            newValue.name += '.' + ext;
          }

          if (newValue.name !== oldValue.name)
          {
            view.model.change('attachments', [newValue], [oldValue]);
          }

          view.hideEditor();

          return false;
        });

        $form
          .append($value)
          .append($submit)
          .appendTo(this.el);

        $value.focus();
      }

    }

  });
});
