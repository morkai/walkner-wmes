// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/isElementInView',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/planning/util/contextMenu',
  '../dictionaries',
  '../Entry',
  './ChatView',
  './ObserversView',
  './AttachmentsView',
  './NavbarView',
  'app/wmes-fap-entries/templates/details'
], function(
  _,
  $,
  user,
  viewport,
  View,
  idAndLabel,
  isElementInView,
  orgUnits,
  setUpUserSelect2,
  contextMenu,
  dictionaries,
  Entry,
  ChatView,
  ObserversView,
  AttachmentsView,
  NavbarView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-statusAction': function(e)
      {
        if (e.currentTarget.classList.contains('btn-info'))
        {
          this.start();
        }
        else if (e.currentTarget.classList.contains('btn-success'))
        {
          this.finish();
        }
      },
      'click .fap-levelIndicator-inner': function(e)
      {
        var details = this.model.serializeDetails();
        var newLevel = +e.currentTarget.dataset.level;

        if (newLevel === details.level)
        {
          return;
        }

        if (details.auth.manage || (details.auth.level && newLevel === details.level + 1))
        {
          this.model.change('level', newLevel);
        }
      },
      'click .fap-editable-toggle': function(e)
      {
        var $prop = this.$(e.target).closest('.fap-prop');

        this.showEditor($prop, $prop[0].dataset.prop);
      },
      'mouseup .fap-autolink': function(e)
      {
        var id = e.currentTarget.dataset.id;

        if (e.button === 1)
        {
          switch (e.currentTarget.dataset.type)
          {
            case 'order':
              window.open('/#orders/' + id);
              break;

            case 'product':
              window.open('/r/nc12/' + id);
              break;

            case 'document':
              if (user.isAllowedTo('DOCUMENTS:VIEW'))
              {
                window.open('/#orderDocuments/tree?file=' + id);
              }
              else
              {
                window.open('/orderDocuments/' + id);
              }
              break;
          }
        }
        else if (NavbarView.appNavbarView)
        {
          this.showAutolinkMenu(e);
        }
        else
        {
          $('.navbar-search-phrase').first().val(id).focus();
        }

        return false;
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
      view.listenTo(dictionaries.settings, 'change reset', view.onSettingChange);

      $(window).on('keydown.' + view.idPrefix, view.onKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        statusAction: this.serializeStatusAction(),
        model: this.model.serializeDetails()
      };
    },

    serializeStatusAction: function()
    {
      var auth = this.model.serializeDetails().auth;
      var status = this.model.get('status');

      if (status === 'finished')
      {
        if (auth.restart)
        {
          return {
            type: 'info',
            label: this.t('PAGE_ACTION:restart')
          };
        }
      }
      else if (auth.status)
      {
        if (status === 'pending')
        {
          return {
            type: 'info',
            label: this.t('PAGE_ACTION:start')
          };
        }

        return {
          type: 'success',
          label: this.t('PAGE_ACTION:finish')
        };
      }

      return null;
    },

    afterRender: function()
    {
      this.updateAuth();
      this.updateUnseen();
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

      cancelAnimationFrame(view.timers.unseen);

      view.timers.unseen = requestAnimationFrame(view.updateUnseen.bind(view));
    },

    resolveUpdater: function(prop)
    {
      switch (prop)
      {
        case 'status':
          return this.updateStatus;

        case 'level':
          return this.updateLevel;

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
        case 'subCategory':
        case 'mrp':
        case 'nc12':
        case 'productName':
        case 'divisions':
        case 'lines':
        case 'assessment':
        case 'mainAnalyzer':
        case 'subdivisionType':
        case 'componentCode':
        case 'componentName':
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

    updateUnseen: function()
    {
      var view = this;
      var changes = view.model.serializeDetails().observer.changes;

      view.$el
        .removeClass('fap-is-unseen')
        .find('.fap-is-unseen')
        .removeClass('fap-is-unseen');

      if (!changes.any)
      {
        return;
      }

      Object.keys(changes).forEach(function(prop)
      {
        switch (prop)
        {
          case 'any':
            break;

          case 'all':
            view.$el.toggleClass('fap-is-unseen', changes[prop]);
            break;

          case 'observers':
          case 'subscribers':
          case 'subscribers$added':
          case 'subscribers$removed':
            view.$('.fap-observers').addClass('fap-is-unseen');
            break;

          case 'attachments':
            view.$('.fap-attachments').addClass('fap-is-unseen');
            break;

          case 'comment':
            view.$('.fap-chat').addClass('fap-is-unseen');
            break;

          case 'status':
            view.$id('message').addClass('fap-is-unseen');
            break;

          default:
            view.$('.fap-prop[data-prop="' + prop + '"]').addClass('fap-is-unseen');
            break;
        }
      });
    },

    updateText: function($prop, text, valueSelector)
    {
      if (!valueSelector)
      {
        valueSelector = '.fap-prop-value';
      }

      var el = $prop instanceof $ ? $prop.find(valueSelector)[0] : $prop;

      while (el.childNodes.length
        && (!el.childNodes[0].classList || !el.childNodes[0].classList.contains('fap-editor')))
      {
        el.removeChild(el.childNodes[0]);
      }

      this.$(el).closest(valueSelector).prepend(text);
    },

    updateProp: function(prop)
    {
      var $prop = this.$('.fap-prop[data-prop="' + prop + '"]');

      if ($prop.length)
      {
        this.updateText($prop, this.model.serializeDetails()[prop]);
      }
    },

    updateQty: function()
    {
      var $prop = this.$('.fap-prop[data-prop="qty"]');
      var details = this.model.serializeDetails();

      this.updateText($prop.find('[data-prop="qtyDone"]')[0], details.qtyDone, '[data-prop="qtyDone"]');
      this.updateText($prop.find('[data-prop="qtyTodo"]')[0], details.qtyTodo, '[data-prop="qtyTodo"]');
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
      else
      {
        html = '<a class="fap-autolink" data-type="order" data-id="' + details.orderNo + '">'
          + details.orderNo
          + '</a>';
      }

      $value.prepend(html);
    },

    updateAnalyzers: function()
    {
      this.updateProp('mainAnalyzer');
      this.updateProp('analyzers');
    },

    updateStatus: function()
    {
      this.updateMessage();

      var statusAction = this.serializeStatusAction();

      if (statusAction)
      {
        this.$id('statusAction')
          .removeClass('btn-info btn-success')
          .addClass('btn-' + statusAction.type)
          .text(statusAction.label);
      }
    },

    updateLevel: function()
    {
      this.$id('levelIndicator').html(this.model.serializeDetails().levelIndicator);
      this.toggleWhy5();
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
      var valueSelector = '.fap-analysis-why-value';

      view.$(valueSelector).each(function(i)
      {
        view.updateText(this, why5[i] || '', valueSelector);
      });
    },

    toggleWhy5: function()
    {
      var hidden = this.model.get('level') !== 4;

      this.$('.fap-prop[data-prop="why5"]')
        .parent()
        .toggleClass('hidden', hidden)
        .next()
        .toggleClass('hidden', hidden);
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

        this.editors[prop].call(this, $prop);

        this.trigger('editor:shown', prop);
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

      var prop = view.$('.fap-is-editing').removeClass('fap-is-editing').attr('data-prop');

      view.trigger('editor:hidden', prop);
    },

    showAutolinkMenu: function(e)
    {
      if (!NavbarView.appNavbarView)
      {
        return;
      }

      var $results = NavbarView.appNavbarView.renderSearchResults(
        NavbarView.appNavbarView.parseSearchPhrase(e.currentTarget.dataset.id)
      );

      while ($results.length)
      {
        var $last = $results.children().last();

        if ($last.hasClass('dropdown-header') || $last.hasClass('divider'))
        {
          $last.remove();
        }
        else
        {
          break;
        }
      }

      var menu = [];
      var groups = 0;

      $results.children().each(function()
      {
        if (groups > 1)
        {
          return;
        }

        if (this.classList.contains('navbar-search-result'))
        {
          menu.push({
            label: this.textContent,
            href: this.querySelector('a').href,
            handler: function() { window.open(this.href); }
          });

          return;
        }

        groups += 1;

        if (groups > 1)
        {
          return;
        }

        if (this.classList.contains('dropdown-header'))
        {
          menu.push(this.textContent);
        }
        else if (this.classList.contains('divider'))
        {
          menu.push('-');
        }
      });

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    finish: function()
    {
      if (this.model.get('solution').trim() === '')
      {
        this.showEditor(this.$('.fap-is-editable[data-prop="solution"]'), 'solution');

        this.once('editor:hidden', function()
        {
          if (this.model.get('solution').trim() !== '')
          {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }
        });
      }
      else
      {
        this.model.multiChange({
          status: 'finished',
          finishedAt: new Date()
        });
      }
    },

    start: function()
    {
      this.model.multiChange({
        status: 'started',
        startedAt: new Date(),
        finishedAt: null
      });
    },

    onKeyDown: function(e)
    {
      if (e.originalEvent.key === 'Escape')
      {
        this.hideEditor();
      }
    },

    onSettingChange: function()
    {
      this.model.updateAuth();
      this.updateAuth();
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

        var propTop = $prop[0].offsetTop;
        var height = (propTop - $form.offset().top) + $form.outerHeight(true);

        if (isElementInView($prop, {fullyInView: true, height: height}))
        {
          $value.focus();
        }
        else
        {
          $('html, body').stop(true, false).animate({scrollTop: propTop}, function()
          {
            $value.focus();
          });
        }
      },

      select: function($prop, options, prepareData)
      {
        var view = this;
        var prop = $prop[0].dataset.prop;
        var oldValue = view.model.get(prop);
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<select class="form-control"></select>');
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');

        $form.on('submit', function()
        {
          var newValue = $value.val();

          if (prepareData)
          {
            view.model.multiChange(prepareData(newValue, oldValue, prop, $prop));
          }
          else
          {
            view.model.change(prop, newValue);
          }

          view.hideEditor();

          return false;
        });

        $value.html(options.map(function(option)
        {
          return '<option value="' + option.id + '">' + _.escape(option.text) + '</option>';
        }).join(''));

        $value.val(oldValue);

        $form
          .append($value)
          .append($submit)
          .appendTo($prop.find('.fap-prop-value'));

        $value.focus();
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

      category: function($category)
      {
        var view = this;
        var oldValue = view.model.get('category');
        var options = dictionaries.categories
          .filter(function(c)
          {
            return c.id === oldValue || c.get('active');
          })
          .map(function(c)
          {
            return {
              id: c.id,
              text: c.getLabel()
            };
          });

        var $subCategory = view.$('.fap-prop[data-prop="subCategory"]').addClass('fap-is-editing');

        view.editors.subCategory.call(view, $subCategory, oldValue);

        view.editors.select.call(view, $category, options, function(newValue)
        {
          var subCategory = $subCategory.find('.form-control').val();

          return {
            category: newValue,
            subCategory: subCategory === 'null' ? null : subCategory
          };
        });

        $category.find('.form-control').on('change', function()
        {
          $subCategory.find('.fap-editor').remove();

          view.editors.subCategory.call(view, $subCategory, this.value);
        });
      },

      subCategory: function($prop, parent)
      {
        if (!parent)
        {
          parent = this.model.get('category');
        }

        var oldValue = this.model.get('subCategory');
        var options = dictionaries.subCategories
          .filter(function(c)
          {
            return c.get('parent') === parent && (c.id === oldValue || c.get('active'));
          })
          .map(function(c)
          {
            return {
              id: c.id,
              text: c.getLabel()
            };
          });

        if (!options.length)
        {
          options.unshift({id: null, text: ''});
        }

        this.editors.select.call(this, $prop, options, function(newValue)
        {
          return {
            category: parent,
            subCategory: newValue === 'null' ? null : newValue
          };
        });
      },

      subdivisionType: function($prop)
      {
        var view = this;
        var options = Entry.SUBDIVISION_TYPES.map(function(type)
        {
          return {
            id: type,
            text: view.t('subdivisionType:' + type)
          };
        });

        view.editors.select.call(view, $prop, options);
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
      },

      componentCode: function($prop)
      {
        var view = this;
        var oldValue = view.model.get('componentCode');
        var $form = $('<form class="fap-editor"></form>');
        var $value = $('<input class="form-control" type="text" pattern="^[0-9]{12}$" maxlength="12">');
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
              componentCode: '',
              componentName: ''
            });

            view.hideEditor();

            return false;
          }

          $value.prop('disabled', true);
          $submit.prop('disabled', true);

          var req = view.ajax({
            method: 'POST',
            url: '/fap/entries;validate-component?nc12=' + newValue
          });

          req.fail(function()
          {
            if (req.statusText === 'abort')
            {
              return;
            }

            if (req.status !== 404)
            {
              $value.prop('disabled', false);
              $submit.prop('disabled', false);

              viewport.msg.show({
                type: 'error',
                time: 2500,
                text: view.t('componentCode:failure')
              });

              return;
            }

            view.model.multiChange({
              componentCode: newValue,
              componentName: ''
            });

            view.hideEditor();
          });

          req.done(function(res)
          {
            view.model.multiChange({
              componentCode: res._id,
              componentName: res.name
            });

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
      }

    }

  });
});
