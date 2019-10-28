// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/data/mrpControllers',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  _,
  time,
  mrpControllers,
  renderOrgUnitPath
) {
  'use strict';

  return function decorateProdFlow(prodFlow, linkMrpControllers)
  {
    var data = prodFlow.toJSON();

    data.deactivatedAt = data.deactivatedAt ? time.format(data.deactivatedAt, 'LL') : '';

    data.subdivision = renderOrgUnitPath(prodFlow.getSubdivision(), true, false);
    data.orgUnitsText = renderOrgUnitPath(prodFlow, false, false);

    data.mrpControllers = (data.mrpController || [])
      .map(function(mrpControllerId)
      {
        var mrpController = mrpControllers.get(mrpControllerId);

        if (!mrpController)
        {
          return null;
        }

        if (linkMrpControllers)
        {
          return '<a href="' + mrpController.genClientUrl() + '">'
            + _.escape(mrpController.getLabel())
            + '</a>';
        }

        return {
          href: mrpController.genClientUrl(),
          label: mrpController.getLabel()
        };
      })
      .filter(function(mrpController)
      {
        return !!mrpController;
      });

    if (linkMrpControllers)
    {
      data.mrpControllers = data.mrpControllers.join('; ');
    }

    return data;
  };
});
