// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  '../Entry',
  './ChatView',
  './ObserversView',
  './AttachmentsView',
  'app/wmes-fap-entries/templates/details'
], function(
  _,
  $,
  user,
  viewport,
  View,
  idAndLabel,
  orgUnits,
  setUpUserSelect2,
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

        case 'solver':
          return this.updateSolver;

        case 'problem':
        case 'solution':
        case 'solutionSteps':
          return this.updateMultiline.bind(this, prop);

        case 'qtyTodo':
        case 'qtyDone':
          return this.updateQty;

        case 'orderNo':
          return this.updateOrderNo;

        case 'analyzers':
          return this.updateAnalyzers;

        case 'category':
        case 'mrp':
        case 'nc12':
        case 'productName':
        case 'divisions':
        case 'lines':
        case 'assessment':
        case 'mainAnalyzer':
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

    updateQty: function()
    {
      var $prop = this.$('.fap-prop[data-prop="qty"]');
      var details = this.model.serializeDetails();

      this.updateText($prop.find('[data-prop="qtyDone"]')[0], details.qtyDone);
      this.updateText($prop.find('[data-prop="qtyTodo"]')[0], details.qtyTodo);
    },

    updateOrderNo: function()
    {
      var $prop = this.$('.fap-prop[data-prop="orderNo"]');
      var $value = $prop.find('.fap-prop-value');
      var details = this.model.serializeDetails();

      while ($value[0].firstChild && $value[0].firstChild.nodeName !== 'div')
      {
        $value[0].removeChild($value[0].firstChild);
      }

      var html;

      if (details.orderNo === '-')
      {
        html = '-';
      }
      else if (user.isAllowedTo('ORDERS:VIEW'))
      {
        html = '<a href="#orders/' + details.orderNo + '">' + details.orderNo + '</a>';
      }
      else
      {
        html = details.orderNo;
      }

      $value.prepend(html);
    },

    updateAnalyzers: function()
    {
      this.updateProp('mainAnalyzer');
      this.updateProp('analyzers');
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

      $prop
        .toggleClass('fap-is-multiline', details.multiline[prop])
        .toggleClass('fap-is-success', details.empty[prop] === false);

      this.updateText($prop, details[prop]);
    },

    updateSolver: function()
    {
      var details = this.model.serializeDetails();
      var $solution = this.$('.fap-prop[data-prop="solution"]');
      var $solver = $solution.find('.fa-user');

      $solver.attr('title', details.solver);
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

      textArea: function($prop, required, prepareData)
      {
        var view = this;
        var prop = $prop[0].dataset.prop;
        var oldValue = view.model.get(prop);
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<textarea class="form-control"></textarea>').val(oldValue).prop('required', required);
        var $submit = $('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');

        $value.on('keydown', function(e)
        {
          if (e.key === 'Enter' && e.shiftKey)
          {
            $submit.click();

            return false;
          }
        });

        $form.on('submit', function()
        {
          var newValue = $value.val().trim();

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
        this.editors.textArea.call(this, $prop, false, function(newValue)
        {
          return {
            solution: newValue,
            solver: newValue.trim().length ? user.getInfo() : null
          };
        });
      },

      solutionSteps: function($prop)
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
          dropdownCssClass: 'fap-editor-select2',
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
            analysisDone: false,
            analysisStartedAt: newValue ? new Date() : null,
            analysisFinishedAt: null
          };
        });
      },

      analysisDone: function($prop)
      {
        this.editors.yesNo.call(this, $prop, function(newValue)
        {
          return {
            analysisDone: newValue,
            analysisFinishedAt: newValue ? new Date() : null
          };
        });
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
      },

      orderNo: function($prop)
      {
        var view = this;
        var oldValue = view.model.get('orderNo');
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<input class="form-control" type="text" pattern="^[0-9]{9}$" maxlength="9">');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $value.on('input', function()
        {
          $value[0].setCustomValidity('');
        });

        $form.on('submit', function()
        {
          var newValue = $value.val();

          if (newValue === oldValue)
          {
            view.hideEditor();

            return false;
          }

          if (newValue === '')
          {
            view.model.multiChange({
              orderNo: '',
              mrp: '',
              nc12: '',
              productName: '',
              qtyTodo: 0,
              qtyDone: 0,
              divisions: [],
              lines: []
            });

            view.hideEditor();

            return false;
          }

          $value.prop('disabled', true);
          $submit.prop('disabled', true);

          var req = view.ajax({
            method: 'POST',
            url: '/fap/entries;validate-order?order=' + newValue
          });

          req.fail(function()
          {
            if (req.statusText === 'abort')
            {
              return;
            }

            $value.prop('disabled', false);
            $submit.prop('disabled', false);

            if (req.status === 404)
            {
              $value[0].setCustomValidity(view.t('orderNo:404'));
              $submit.click();
            }
            else
            {
              viewport.msg.show({
                type: 'error',
                time: 2500,
                text: view.t('orderNo:failure')
              });
            }
          });

          req.done(function(res)
          {
            res.divisions = [];

            res.lines.forEach(function(line)
            {
              var division = orgUnits.getAllForProdLine(line).division;

              if (division && res.divisions.indexOf(division) === -1)
              {
                res.divisions.push(division);
              }
            });

            res.divisions.sort(function(a, b)
            {
              return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
            });

            view.model.multiChange(res);

            view.hideEditor();
          });

          return false;
        });

        $value.val(oldValue);

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();
      },

      analyzers: function($prop)
      {
        var view = this;
        var $mainAnalyzer = view.$('.fap-prop[data-prop="mainAnalyzer"]');
        var $analyzers = view.$('.fap-prop[data-prop="analyzers"]');
        var oldValue = [].concat(view.model.get('analyzers'));
        var $mainAnalyzerForm = $('<form class="fap-editor"></form>')
          .append('<input>')
          .append('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');
        var $analyzersForm = $mainAnalyzerForm.clone();
        var $mainAnalyzerInput;
        var $analyzersInput;

        if ($mainAnalyzer.hasClass('fap-is-editable'))
        {
          $mainAnalyzer.addClass('fap-is-editing');

          $mainAnalyzerInput = $mainAnalyzerForm
            .on('submit', submit)
            .appendTo($mainAnalyzer.find('.fap-prop-value'))
            .find('input')
            .val(oldValue.length ? oldValue[0].id : '')
            .on('change', toggle);

          setUpUserSelect2($mainAnalyzerInput, {
            view: view,
            dropdownCssClass: 'fap-editor-select2',
            width: '100%',
            noPersonnelId: true
          });
        }

        if ($analyzers.hasClass('fap-is-editable'))
        {
          $analyzers.addClass('fap-is-editing');

          $analyzersInput = $analyzersForm
            .on('submit', submit)
            .appendTo($analyzers.find('.fap-prop-value'))
            .find('input')
            .val(oldValue.length > 1 ? oldValue.slice(1).map(function(u) { return u.id; }).join(',') : '');

          setUpUserSelect2($analyzersInput, {
            view: view,
            dropdownCssClass: 'fap-editor-select2',
            width: '100%',
            multiple: true,
            noPersonnelId: true
          });
        }

        toggle();

        $prop.find('.select2-container').next().select2('focus');

        function toggle()
        {
          if ($analyzersInput)
          {
            var mainAnalyzer = $mainAnalyzerInput ? $mainAnalyzerInput.val() : oldValue;

            $analyzersInput.select2('enable', mainAnalyzer.length !== 0);
          }
        }

        function submit()
        {
          $mainAnalyzer.removeClass('fap-is-editing');
          $analyzers.removeClass('fap-is-editing');

          var newValue = [];
          var userIds = {};
          var change = true;

          if ($mainAnalyzerInput)
          {
            var newMainAnalyzer = $mainAnalyzerInput.select2('data');

            if (newMainAnalyzer)
            {
              newValue.push({
                id: newMainAnalyzer.id,
                label: newMainAnalyzer.text
              });
            }
          }
          else if (oldValue.length)
          {
            newValue.push(oldValue[0]);
          }
          else
          {
            change = false;
          }

          if (newValue.length)
          {
            userIds[newValue[0].id] = true;

            if ($analyzersInput)
            {
              $analyzersInput.select2('data').forEach(function(newAnalyzer)
              {
                if (userIds[newAnalyzer.id])
                {
                  return;
                }

                newValue.push({
                  id: newAnalyzer.id,
                  label: newAnalyzer.text
                });

                userIds[newAnalyzer.id] = true;
              });
            }
          }

          if (change && compareAnalyzers(newValue))
          {
            view.model.change('analyzers', newValue);
          }

          view.hideEditor();

          return false;
        }

        function compareAnalyzers(newValue)
        {
          var oldValue = view.model.get('analyzers');
          var oldMainAnalyzer = oldValue.length ? oldValue[0].id : null;
          var oldAnalyzers = oldValue.slice(1).map(function(u) { return u.id; }).sort().join(',');
          var newMainAnalyzer = newValue.length ? newValue[0].id : null;
          var newAnalyzers = newValue.slice(1).map(function(u) { return u.id; }).sort().join(',');

          return newMainAnalyzer !== oldMainAnalyzer || newAnalyzers !== oldAnalyzers;
        }
      },

      mainAnalyzer: function()
      {
        this.editors.analyzers.apply(this, arguments);
      }

    }

  });
});
