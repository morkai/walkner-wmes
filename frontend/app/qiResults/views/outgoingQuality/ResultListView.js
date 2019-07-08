// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/qiResults/dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  time,
  viewport,
  ListView,
  orgUnits,
  prodFunctions,
  dictionaries,
  userInfoTemplate
) {
  'use strict';

  return ListView.extend({

    className: function()
    {
      return this.collection.report.get('printable') ? '' : 'is-clickable';
    },

    remoteTopics: {},

    events: _.assign(ListView.prototype.events, {
      'click td[data-id="rid"]': function(e)
      {
        if (this.canManage())
        {
          this.showResultsEditor(e.currentTarget);

          return false;
        }
      },
      'click td[data-id="standard"]': function(e)
      {
        if (this.canManage())
        {
          this.showStandardEditor(e.currentTarget);

          return false;
        }
      }
    }),

    initialize: function()
    {
      this.listenTo(this.collection.report, 'change:oqlWeek', this.onOqlWeekChanged);

      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideEditors();
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
      var report = this.collection.report;

      return !report.get('printable') && report.canManage();
    },

    showResultsEditor: function(td)
    {
      var view = this;
      var $td = view.$(td);

      if ($td.find('form').length)
      {
        return false;
      }

      view.hideEditors();

      var report = view.collection.report;
      var oqlWeek = report.getCurrentWeek();

      if (!oqlWeek)
      {
        return false;
      }

      var oldHtml = $td.html();
      var $form = $('<form class="qi-oqlReport-results-editor"></form>').css({
        position: 'absolute',
        marginTop: '-17px'
      });
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

        $td.css({textAlign: 'center'}).html('<i class="fa fa-spinner fa-spin"></i>');

        var req = view.ajax({
          method: 'POST',
          url: '/qi/reports/outgoingQuality/weeks/' + oqlWeek._id,
          data: JSON.stringify({results: newValue})
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();
        });

        req.done(function()
        {
          viewport.msg.saved();
        });

        req.always(function()
        {
          $td.css({textAlign: ''}).html(oldHtml);
        });

        return false;
      });

      $td.html('').append($form);
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
            + '; '
            + item.result.get('pareto')
            + '; '
            + item.result.get('concern')
            + '</span>';
        }
      });

      setTimeout(function() { $select.focus(); }, 1);
    },

    showStandardEditor: function(td)
    {
      var view = this;
      var $td = view.$(td);

      if ($td.find('form').length)
      {
        $td.find('select').focus();

        return false;
      }

      view.hideEditors();

      var result = view.collection.get($td.closest('tr').attr('data-id'));
      var oldLabel = $td.text();
      var $form = $('<form class="qi-oqlReport-results-editor"></form>');
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

        $td.css({textAlign: 'center'}).html('<i class="fa fa-spinner fa-spin"></i>');

        var req = view.ajax({
          method: 'PUT',
          url: '/qi/results/' + result.id,
          data: JSON.stringify({standard: newValue})
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();

          $td.text(oldLabel);
        });

        req.done(function()
        {
          viewport.msg.saved();

          result.set('standard', newValue);

          $td.text(standard ? standard.get('name') : '');
        });

        req.always(function()
        {
          $td.css({textAlign: ''});
        });

        return false;
      });

      $td.html('').append($form);

      setTimeout(function() { $select.focus(); }, 1);
    },

    hideEditors: function()
    {
      var $el = this.$('form').parent();
      var result = this.collection.get($el.closest('tr').attr('data-id'));
      var html = '';

      if (result)
      {
        if ($el[0].dataset.id === 'rid')
        {
          var rid = result.get('rid');
          var results = this.collection.report.getSpecifiedResults();

          html = rid.toString();

          if (_.includes(results, rid))
          {
            html = '<strong>' + rid + '</strong>';
          }
        }
        else
        {
          var standard = dictionaries.standards.get(result.get('standard'));

          if (standard)
          {
            html = _.escape(standard.get('name'));
          }
        }
      }

      $el.html(html);
    },

    serializeColumns: function()
    {
      var columns = [
        {id: 'kpi', className: 'is-min'},
        {id: 'site', className: 'is-min'},
        {id: 'date', className: 'is-min'},
        {id: 'pareto'},
        {id: 'concern'},
        {id: 'cause'},
        {id: 'countermeasure'},
        {id: 'check', className: 'is-min'},
        {id: 'standard', className: 'is-min'},
        {id: 'who', className: 'is-min'},
        {id: 'when', className: 'is-min'}
      ];

      if (!this.collection.report.get('printable'))
      {
        columns.unshift({id: 'rid', tdClassName: 'is-min is-number'});
      }

      return columns;
    },

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function(filter)
    {
      var results = this.collection;

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

      var printable = report.get('printable');
      var ridToRow = {};
      var allRows = results.map(function(result)
      {
        var obj = result.toJSON();

        if (printable)
        {
          obj.check = obj.check.slice(0, 1);
          obj.who = obj.who.slice(0, 1);

          if (obj.cause.length > 105)
          {
            obj.cause = obj.cause.substring(0, 100) + '...';
          }

          if (obj.countermeasure.length > 105)
          {
            obj.countermeasure = obj.countermeasure.substring(0, 100) + '...';
          }
        }

        obj.kpi = 'OQ';
        obj.site = 'Kętrzyn';
        obj.date = time.format(obj.date, 'L');
        obj.check = obj.check
          .map(function(id) { return prodFunctions.get(id) ? prodFunctions.get(id).getLabel() : id; })
          .join('; ');
        obj.who = obj.who
          .map(function(user) { return userInfoTemplate({userInfo: user}); })
          .join('<br>');
        obj.when = time.format(obj.when, 'L');

        var mrpController = orgUnits.getByTypeAndId('mrpController', obj.pareto);

        if (!printable && mrpController)
        {
          obj.pareto += ': ' + mrpController.get('description');
        }

        obj.fault = obj.concern;
        obj.weight = 0;

        var fault = dictionaries.faults.get(obj.concern);

        if (fault)
        {
          obj.weight = fault.get('weight');

          if (!printable)
          {
            obj.concern += ': ' + fault.get('name');
          }
        }

        var standard = dictionaries.standards.get(obj.standard);

        if (standard)
        {
          obj.standard = standard.get('name');
        }

        ridToRow[obj.rid] = obj;

        return obj;
      });

      if (filter !== false)
      {
        allRows = allRows.filter(function(result) { return !!topWhat[result.fault]; });

        allRows.sort(function(a, b)
        {
          var cmp = topWhat[b.fault] - topWhat[a.fault];

          if (cmp === 0)
          {
            cmp = b.weight - a.weight;
          }

          return cmp;
        });
      }

      var rows = [];

      report.getSpecifiedResults().forEach(function(rid)
      {
        var row = ridToRow[rid];

        if (row)
        {
          row.rid = '<strong>' + row.rid + '</strong>';

          rows.push(row);

          delete ridToRow[rid];
        }
      });

      for (var i = 0; i < topCount; ++i)
      {
        if (rows.length === topCount)
        {
          break;
        }

        var row = allRows.shift();

        if (row && ridToRow[row.rid])
        {
          rows.push(row);
        }
      }

      return rows;
    }

  });
});
