// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/outgoingQuality/results'
], function(
  _,
  $,
  time,
  viewport,
  View,
  userInfoTemplate,
  orgUnits,
  prodFunctions,
  dictionaries,
  template
) {
  'use strict';

  function trim(str)
  {
    return (str || '').replace(/\n+/g, '\n').trim();
  }

  return View.extend({

    template: template,

    events: {
      'click a[data-action="editResults"]': function(e)
      {
        this.showResultsEditor(e.currentTarget);

        return false;
      },
      'click a[data-action="editStandard"]': function(e)
      {
        this.showStandardEditor(e.currentTarget);

        return false;
      }
    },

    initialize: function()
    {
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection.report, 'change:oqlWeek', this.onOqlWeekChanged);

      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        canManage: this.canManage(),
        results: this.serializeResults()
      };
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideEditors();
      }
    },

    onOqlWeekChanged: function(report, oqlWeek)
    {
      if (oqlWeek === report.getCurrentWeek())
      {
        this.render();
      }
    },

    canManage: function()
    {
      return this.collection.report.canManage();
    },

    showResultsEditor: function(a)
    {
      var view = this;
      var $prop = view.$(a).closest('.qi-oql-prop');

      if ($prop.find('form').length)
      {
        return;
      }

      view.hideEditors();

      var report = view.collection.report;
      var oqlWeek = report.getCurrentWeek();

      if (!oqlWeek)
      {
        return;
      }

      var oldHtml = $prop.html();
      var $form = $('<form class="qi-oql-results-editor"></form>');
      var $select = $('<input>').val(oqlWeek.results.join(','));
      var $submit = $('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');

      $form.append($select).append($submit);

      $submit.on('click', function()
      {
        var newValue = $select
          .val()
          .split(',')
          .filter(function(v) { return v.length > 0; })
          .map(function(v) { return +v; });

        if (_.isEqual(newValue, oqlWeek.results))
        {
          view.hideEditors();

          return false;
        }

        viewport.msg.saving();

        $prop.find('.qi-oql-prop-value').html('<i class="fa fa-spinner fa-spin"></i>');

        var req = view.ajax({
          method: 'POST',
          url: '/qi/reports/outgoingQuality/weeks/' + oqlWeek._id,
          data: JSON.stringify({results: newValue})
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();

          $prop.html(oldHtml);
        });

        req.done(function()
        {
          viewport.msg.saved();

          view.hideEditors();
        });

        return false;
      });

      $prop.append($form);

      $select.select2({
        width: '300px',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        maximumSelectionSize: 3,
        data: view.collection.map(function(result)
        {
          var rid = result.get('rid').toString();

          return {
            id: rid,
            text: rid,
            result: result
          };
        }),
        formatSelection: function(item)
        {
          return item.id;
        },
        formatResult: function(item)
        {
          return '<span class="text-mono">'
            + item.id
            + ' | '
            + item.result.get('mrp')
            + ' | '
            + item.result.get('faultCode')
            + '</span>';
        }
      });

      setTimeout(function() { $select.focus(); }, 1);
    },

    showStandardEditor: function(a)
    {
      var view = this;
      var $prop = view.$(a).closest('.qi-oql-prop');

      if ($prop.find('form').length)
      {
        return;
      }

      view.hideEditors();

      var result = view.collection.get($prop.closest('.qi-oql-result').attr('data-id'));
      var oldLabel = $prop.find('.qi-oql-prop-value').text();
      var $form = $('<form class="qi-oql-results-editor"></form>');
      var $select = $('<select class="form-control"><option></option></select>');
      var $submit = $('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');

      dictionaries.standards.forEach(function(standard)
      {
        $('<option></option>')
          .attr('value', standard.id)
          .prop('selected', standard.id === result.get('standard'))
          .text(standard.get('name'))
          .appendTo($select);
      });

      $form.append($select).append($submit);

      $submit.on('click', function()
      {
        var newValue = $select.val();
        var standard = dictionaries.standards.get(newValue);

        if (!standard)
        {
          newValue = null;
        }

        if (newValue === result.get('standard'))
        {
          view.hideEditors();

          return false;
        }

        viewport.msg.saving();

        $prop.find('.qi-oql-prop-value').html('<i class="fa fa-spinner fa-spin"></i>');

        var req = view.ajax({
          method: 'PUT',
          url: '/qi/results/' + result.id,
          data: JSON.stringify({standard: newValue})
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();

          $prop.find('.qi-oql-prop-value').text(oldLabel);
        });

        req.done(function()
        {
          viewport.msg.saved();

          result.set('standard', newValue);

          view.hideEditors();
        });

        return false;
      });

      $prop.append($form);

      setTimeout(function() { $select.focus(); }, 1);
    },

    hideEditors: function()
    {
      var $form = this.$('form');

      if (!$form.length)
      {
        return;
      }

      var $prop = $form.closest('.qi-oql-prop');

      $form.remove();

      var result = this.collection.get($prop.closest('.qi-oql-result').attr('data-id'));

      if (!result)
      {
        return;
      }

      var prop = $prop.attr('data-id');
      var html = '-';

      if (prop === 'rid')
      {
        var rid = result.get('rid');
        var results = this.collection.report.getSpecifiedResults();

        html = rid.toString();

        if (_.includes(results, rid))
        {
          html = '<strong>' + rid + '</strong>';
        }
      }
      else if (prop === 'standard')
      {
        var standard = dictionaries.standards.get(result.get('standard'));

        if (standard)
        {
          html = _.escape(standard.get('name'));
        }
      }

      $prop.find('.qi-oql-prop-value').html(html);
    },

    serializeResults: function()
    {
      var view = this;
      var results = view.collection;

      if (!results.length)
      {
        return [];
      }

      var report = results.report;
      var topCount = report.getTopCount();
      var topWhat = {};

      _.forEach((report.get('top') || {}).what, function(what, i)
      {
        if (i < topCount)
        {
          topWhat[what[0]] = what[1];
        }
      });

      var ridMap = {};
      var allResults = results
        .map(function(result) { return ridMap[result.get('rid')] = view.serializeResult(result); })
        .filter(function(result) { return !!topWhat[result.faultCode]; })
        .sort(function(a, b)
        {
          var cmp = topWhat[b.faultCode] - topWhat[a.faultCode];

          if (cmp === 0)
          {
            cmp = b.weight - a.weight;
          }

          return cmp;
        });

      var selectedResults = [];

      report.getSpecifiedResults().forEach(function(rid)
      {
        var result = ridMap[rid];

        if (result)
        {
          result.rid = '<strong>' + result.rid + '</strong>';

          selectedResults.push(result);

          delete ridMap[rid];
        }
      });

      for (var i = 0; i < topCount; ++i)
      {
        if (selectedResults.length === topCount)
        {
          break;
        }

        var result = allResults.shift();

        if (result && ridMap[result.rid])
        {
          selectedResults.push(result);
        }
      }

      return selectedResults;
    },

    serializeResult: function(result)
    {
      var obj = result.toJSON();

      obj.kpi = 'OQ';
      obj.site = 'Kętrzyn';
      obj.date = time.format(obj.inspectedAt, 'L');
      obj.problem = trim(obj.problem);
      obj.family = obj.mrp;

      var mrpController = orgUnits.getByTypeAndId('mrpController', obj.mrp);

      if (mrpController)
      {
        obj.family += ': ' + mrpController.get('description');
      }

      obj.weight = 0;
      obj.concern = obj.faultCode;

      var fault = dictionaries.faults.get(obj.faultCode);

      if (fault)
      {
        obj.weight = fault.get('weight');
        obj.concern += ': ' + fault.get('name');
      }

      var errorCategory = dictionaries.errorCategories.get(obj.errorCategory);

      if (errorCategory)
      {
        obj.errorCategory = errorCategory.getLabel();
      }

      var standard = dictionaries.standards.get(obj.standard);

      if (standard)
      {
        obj.standard = standard.get('name');
      }

      obj.rootCause.forEach(function(rootCause)
      {
        rootCause.forEach(function(why, i)
        {
          rootCause[i] = trim(why);
        });
      });

      obj.correctiveActions = obj.correctiveActions.map(function(action)
      {
        return {
          when: time.format(action.when, 'L'),
          who: action.who.map(function(user)
          {
            var userInfo = userInfoTemplate({userInfo: user});
            var prodFunction = prodFunctions.get(user.prodFunction);

            if (prodFunction)
            {
              userInfo += ' (' + prodFunction.getLabel() + ')';
            }

            return userInfo;
          }),
          what: trim(action.what)
        };
      });

      return obj;
    }

  });
});
