// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'h5.rql/index',
  'app/time',
  'app/user'
], function(
  rql,
  time,
  currentUser
) {
  'use strict';

  return (options = {}) =>
  {
    const args = [];

    if (options.dateProperty === 'month')
    {
      args.push({
        name: 'eq',
        args: ['month', time.getMoment().format('YYYY-MM')]
      });
    }
    else
    {
      args.push(
        {
          name: 'ge',
          args: [
            options.dateProperty || 'date',
            time.getMoment().startOf('month').valueOf()
          ]
        },
        {
          name: 'lt',
          args: [
            options.dateProperty || 'date',
            time.getMoment().startOf('month').add(1, 'months').valueOf()
          ]
        }
      );
    }

    if (options.interval)
    {
      args.push({name: 'eq', args: ['interval', options.interval]});
    }

    if (currentUser.data.oshDepartment)
    {
      let prop = 'department';

      if (options.orgUnitProperty != null)
      {
        prop = 'oshDepartment';

        if (options.orgUnitProperty.length)
        {
          prop = options.orgUnitProperty + '.' + prop;
        }
      }

      args.push({name: 'eq', args: [prop, currentUser.data.oshDepartment]});
    }
    else if (currentUser.data.oshWorkplace)
    {
      let prop = 'workplace';

      if (options.orgUnitProperty != null)
      {
        prop = 'oshWorkplace';

        if (options.orgUnitProperty.length)
        {
          prop = options.orgUnitProperty + '.' + prop;
        }
      }

      args.push({name: 'eq', args: [prop, currentUser.data.oshWorkplace]});
    }

    return rql.Query.fromObject({
      selector: {
        name: 'and',
        args
      }
    });
  };
});
