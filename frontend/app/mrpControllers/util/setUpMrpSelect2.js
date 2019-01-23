// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'Sortable',
  'app/broker',
  'app/user',
  'app/data/orgUnits',
  './ownMrps'
], function(
  _,
  select2,
  Sortable,
  broker,
  user,
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
        if (mrp.id.length > maxMrpLength)
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
    if (!$input || !$input.length)
    {
      throw new Error('Unspecified $input!');
    }

    if (mrps === null)
    {
      reload();
    }

    $input.select2(_.assign({
      width: '300px',
      allowClear: true,
      multiple: true,
      data: mrps,
      minimumResultsForSearch: 1,
      matcher: function(term, text, item)
      {
        term = term.toUpperCase();

        return item.id.toUpperCase().indexOf(term) >= 0
          || item.text.toUpperCase().indexOf(term) >= 0;
      },
      formatSelection: function(item)
      {
        return _.escape(item.id);
      },
      formatResult: function(item, $container, query, e)
      {
        var id = item.id;

        while (id.length < maxMrpLength)
        {
          id += ' ';
        }

        var html = ['<span class="text-mono">'];

        select2.util.markMatch(id, query.term, html, e);

        if (item.text === '')
        {
          html.push('</span>');
        }
        else
        {
          html.push('</span><span class="text-small">: ');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');
        }

        return html.join('');
      },
      tokenizer: function(input, selection, selectCallback)
      {
        var result = input;
        var options = {};

        selection.forEach(function(item)
        {
          options[item.id] = true;
        });

        (input.match(/[A-Z0-9]{3,}[^A-Z0-9]/ig) || []).forEach(function(mrp)
        {
          result = result.replace(mrp, '');

          mrp = mrp.toUpperCase().replace(/[^A-Z0-9]+/g, '');

          if (!options[mrp])
          {
            selectCallback({id: mrp, text: mrp});
            options[mrp] = true;
          }
        });

        return input === result ? null : result.replace(/\s+/, ' ').trim();
      }
    }, options));

    if (options && options.sortable)
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

    if (options && options.own && options.view)
    {
      ownMrps.attach(options.view, $input);
    }

    $input.select2(
      'data',
      $input
        .val()
        .split(',')
        .filter(function(mrp) { return mrp.length; })
        .map(function(mrp) { return {id: mrp, text: mrp}; })
    );

    return $input;
  };
});
