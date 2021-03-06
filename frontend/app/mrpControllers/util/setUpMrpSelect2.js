// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'Sortable',
  'app/broker',
  'app/user',
  'app/i18n',
  'app/data/orgUnits',
  './ownMrps'
], function(
  _,
  select2,
  Sortable,
  broker,
  user,
  t,
  orgUnits,
  ownMrps
) {
  'use strict';

  var maxMrpLength = 0;
  var mrps = null;

  function reload()
  {
    var userMrps = (user.data.mrps || [])
      .filter(function(mrp) { return !orgUnits.getByTypeAndId('mrpController', mrp); })
      .map(function(mrp)
      {
        return {
          id: mrp,
          text: ''
        };
      });

    maxMrpLength = 0;
    mrps = orgUnits.getAllByType('mrpController')
      .filter(function(mrp)
      {
        return mrp.id.indexOf('~') === -1;
      })
      .map(function(mrp)
      {
        if (mrp.id.length > maxMrpLength && mrp.id.length < 6)
        {
          maxMrpLength = mrp.id.length;
        }

        return {
          id: mrp.id,
          text: mrp.get('description')
        };
      })
      .concat(userMrps)
      .sort(function(a, b)
      {
        return a.id.localeCompare(b.id, undefined, {numeric: true});
      });
  }

  broker.subscribe('mrpControllers.synced', reload);

  return function setUpMrpSelect2($input, options)
  {
    if (!$input)
    {
      throw new Error('Unspecified $input!');
    }

    if (!$input.length)
    {
      return $input;
    }

    if (!options)
    {
      options = {};
    }

    if (mrps === null)
    {
      reload();
    }

    var data = !options.itemDecorator ? mrps : mrps.map(function(item)
    {
      return options.itemDecorator(_.clone(item), false);
    });

    if (options.extra)
    {
      data = options.extra(data);
    }

    if (options.filter)
    {
      data = data.filter(options.filter);
    }

    $input.select2(_.assign({
      width: '300px',
      allowClear: true,
      multiple: true,
      data: data,
      minimumResultsForSearch: 1,
      matcher: function(term, text, item)
      {
        term = term.toUpperCase();

        return item.id.toUpperCase().indexOf(term) >= 0
          || item.text.toUpperCase().indexOf(term) >= 0;
      },
      formatNoMatches: function(term)
      {
        if (/^[A-Z0-9]{3,}$/i.test(term))
        {
          return t('mrpControllers', 'select2:noMatches:virtual', {
            mrp: term.toUpperCase()
          });
        }

        return t('mrpControllers', 'select2:noMatches');
      },
      formatSelection: function(item)
      {
        return _.escape(item.id);
      },
      formatResult: function(item, $container, query, e)
      {
        var id = item.id;
        var noId = id.length >= 6 && item.text.length >= 6;
        var html = [];

        if (!noId)
        {
          while (id.length < maxMrpLength)
          {
            id += ' ';
          }

          html.push('<span class="text-mono">');

          select2.util.markMatch(id, query.term, html, e);
        }

        if (item.text === '')
        {
          html.push('</span>');
        }
        else
        {
          if (!noId)
          {
            html.push('</span>');
          }

          html.push('<span class="text-small">');

          if (!noId)
          {
            html.push(': ');
          }

          if (item.icon)
          {
            html.push('<i class="fa ' + item.icon.id + '" style="color: ' + (item.icon.color || '#000') + '"></i> ');
          }

          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');
        }

        return html.join('');
      },
      tokenizer: function(input, selection, selectCallback)
      {
        if (input === '' || input === options.placeholder)
        {
          return null;
        }

        var result = input;
        var items = {};

        selection.forEach(function(item)
        {
          items[item.id] = true;
        });

        (input.match(/[A-Z0-9]{3,}[^A-Z0-9]/ig) || []).forEach(function(mrp)
        {
          result = result.replace(mrp, '');
          mrp = mrp.toUpperCase().replace(/[^A-Z0-9]+/g, '');

          if (items[mrp])
          {
            return;
          }

          var item = {id: mrp, text: mrp};

          if (options.itemDecorator)
          {
            item = options.itemDecorator(item, true);
          }

          if (!item.locked && !item.disabled)
          {
            selectCallback(item);
            items[mrp] = true;
          }
        });

        return input === result ? null : result.replace(/\s+/, ' ').trim();
      }
    }, options));

    if (options.sortable)
    {
      var sortable = new Sortable($input.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $input.select2('onSortStart');
        },
        onEnd: function()
        {
          $input.select2('onSortEnd').select2('focus');
        }
      });

      if (options.view)
      {
        var destroy = options.view.destroy;

        options.view.destroy = function()
        {
          destroy.apply(options.view, arguments);

          sortable.destroy();
        };
      }
    }

    if (options.own && options.view)
    {
      ownMrps.attach(options.view, $input);
    }

    var selected = $input
      .val()
      .split(',')
      .filter(function(mrp) { return mrp.length; })
      .map(function(mrp)
      {
        var item = {id: mrp, text: mrp};

        if (options.itemDecorator)
        {
          item = options.itemDecorator(item, true);
        }

        return item;
      });

    $input.select2('data', selected.length && options.multiple === false ? selected[0] : selected);

    return $input;
  };
});
