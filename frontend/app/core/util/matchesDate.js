// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function matchesDate(rqlQuery, name, value)
  {
    if (value == null)
    {
      return true;
    }

    var fromTerm = null;
    var toTerm = null;

    rqlQuery.selector.args.forEach(function(term)
    {
      if (term.args[0] !== name)
      {
        return;
      }

      if (term.name === 'ge' || term.name === 'gt')
      {
        fromTerm = term;
      }
      else if (term.name === 'lt' || term.name === 'le')
      {
        toTerm = term;
      }
    });

    if (!fromTerm && !toTerm)
    {
      return true;
    }

    if (!(value instanceof Date))
    {
      value = new Date(value);
    }

    var time = value.getTime();

    if (isNaN(time))
    {
      return true;
    }

    if (fromTerm)
    {
      var fromTime = fromTerm.args[0] instanceof Date ? fromTerm.args[0] : new Date(fromTerm.args[0]);

      // time > from
      if (fromTerm.name === 'gt' && time <= fromTime)
      {
        return false;
      }

      // time >= from
      if (fromTerm.name === 'ge' && time < fromTime)
      {
        return false;
      }
    }

    if (toTerm)
    {
      var toTime = toTerm.args[0] instanceof Date ? toTerm.args[0] : new Date(toTerm.args[0]);

      // time < to
      if (toTerm.name === 'lt' && time >= toTime)
      {
        return false;
      }

      // time <= to
      if (toTerm.name === 'le' && time > toTime)
      {
        return false;
      }
    }

    return true;
  };
});
