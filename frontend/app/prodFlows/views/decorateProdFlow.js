define([
  'underscore',
  'app/data/mrpControllers',
  'app/data/views/renderOrgUnitPath'
], function(
  _,
  mrpControllers,
  renderOrgUnitPath
) {
  'use strict';

  return function decorateProdFlow(prodFlow, linkMrpControllers)
  {
    var data = prodFlow.toJSON();

    data.subdivision = renderOrgUnitPath(prodFlow.getSubdivision(), true, false);

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
