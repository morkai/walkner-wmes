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

  var NO_DESCRIPTION = {
    prodFlow: true,
    subdivision: true
  };

  var cachedItems = {};

  function reload(orgUnitType)
  {
    cachedItems[orgUnitType] = orgUnits.getAllByType(orgUnitType)
      .map(function(model)
      {
        return {
          id: model.id,
          text: NO_DESCRIPTION[orgUnitType] ? model.get('name') : model.get('description'),
          model: model
        };
      })
      .sort(function(a, b)
      {
        return a.id.localeCompare(b.id, undefined, {numeric: true});
      });

    return cachedItems[orgUnitType];
  }

  return function setUpOrgUnitSelect2($input, options)
  {
    if (!$input || !$input.length)
    {
      throw new Error('Unspecified $input!');
    }

    options = _.assign({orgUnitType: 'prodLine'}, options);

    var noDescription = NO_DESCRIPTION[options.orgUnitType] === true;
    var maxIdLength = 0;
    var items = cachedItems[options.orgUnitType];

    if (!items)
    {
      var topicPrefix = orgUnits.getCollection(options.orgUnitType).model.topicPrefix;

      broker.subscribe(topicPrefix + '.synced', reload.bind(null, options.orgUnitType));

      items = reload(options.orgUnitType);
    }

    var divisions = {};

    items = items.filter(function(item)
    {
      if (!options.showDeactivated && item.model.get('deactivatedAt'))
      {
        return false;
      }

      if (options.itemFilter && !options.itemFilter(item))
      {
        return false;
      }

      if (item.id.length > maxIdLength)
      {
        maxIdLength = item.id.length;
      }

      if (options.orgUnitType === 'subdivision')
      {
        var division = item.model.get('division');

        if (!divisions[division])
        {
          divisions[division] = [];
        }

        divisions[division].push(item);
      }

      return true;
    });

    if (options.orgUnitType === 'subdivision')
    {
      items = Object.keys(divisions).map(function(division)
      {
        return {
          text: division,
          children: divisions[division]
        };
      });
    }

    $input.removeClass('form-control').select2(_.assign({
      width: '100%',
      allowClear: true,
      multiple: false,
      data: items,
      minimumResultsForSearch: 1,
      matcher: function(term, text, item)
      {
        term = term.toUpperCase();

        if (!noDescription && item.id.toUpperCase().indexOf(term) >= 0)
        {
          return true;
        }

        return item.text.toUpperCase().indexOf(term) >= 0;
      },
      formatSelection: function(item)
      {
        if (!item.model)
        {
          return null;
        }

        if (options.orgUnitType === 'subdivision')
        {
          return _.escape(item.model.get('division') + ' \\ ' + item.model.get('name'));
        }

        return _.escape(noDescription ? item.text : item.id);
      },
      formatResult: function(item, $container, query, e)
      {
        var html = [];

        if (!noDescription || item.text === '')
        {
          var id = item.id;

          while (id.length < maxIdLength)
          {
            id += ' ';
          }

          html.push('<span class="text-mono">');

          if (query.term.length)
          {
            select2.util.markMatch(id, query.term, html, e);
          }
          else
          {
            html.push(e(id));
          }
        }

        if (item.text === '')
        {
          html.push('</span>');
        }
        else if (!noDescription)
        {
          html.push('</span><span class="text-small">: ');

          if (query.term.length)
          {
            select2.util.markMatch(item.text, query.term, html, e);
          }
          else
          {
            html.push(e(item.text));
          }

          html.push('</span>');
        }
        else if (query.term.length)
        {
          select2.util.markMatch(item.text, query.term, html, e);
        }
        else
        {
          html.push(e(item.text));
        }

        return html.join('');
      }
    }, options));

    return $input;
  };
});
