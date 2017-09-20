// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'app/broker',
  'app/data/orgUnits'
], function(
  _,
  select2,
  broker,
  orgUnits
) {
  'use strict';

  var maxMrpLength = 0;
  var mrps = null;

  function reload()
  {
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
      .sort(function(a, b)
      {
        return a.id.localeCompare(b.id, undefined, {numeric: true});
      });
  }

  broker.subscribe('mrpControllers.synced', reload);

  reload();

  return function setUpMrpSelect2($input, options)
  {
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
        html.push('</span><span class="text-small">: ');
        select2.util.markMatch(item.text, query.term, html, e);
        html.push('</span>');

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
