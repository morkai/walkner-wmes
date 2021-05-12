// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/templates/userInfo',
  'app/core/util/decimalSeparator'
], function(
  time,
  userInfoTemplate,
  decimalSeparator
) {
  'use strict';

  return function prepareReleasedBom(bom, compRels)
  {
    var components = [];
    var oldToNew = {};
    var newToOld = {};
    var colored = false;
    var extraCompRels = [];

    (compRels || []).forEach(function(compRel)
    {
      compRel.newComponents.forEach(function(newComponent)
      {
        if (!newToOld[newComponent._id])
        {
          newToOld[newComponent._id] = [];
        }
      });

      if (compRel.oldComponents.length === 0)
      {
        extraCompRels.push(compRel);
      }

      compRel.oldComponents.forEach(function(oldComponent)
      {
        if (!oldToNew[oldComponent._id])
        {
          oldToNew[oldComponent._id] = [];
        }

        oldToNew[oldComponent._id].push(compRel);

        compRel.newComponents.forEach(function(newComponent)
        {
          newToOld[newComponent._id].push({
            compRel: compRel,
            oldComponent: oldComponent
          });
        });
      });
    });

    (bom || []).forEach(function(component)
    {
      if (component.attributes)
      {
        component = component.toJSON();
      }

      if (!component.nc12)
      {
        return;
      }

      var qty = (Math.round(component.qty * 1000) / 1000).toString().split('.');

      component.qty = [
        qty[0].toString(),
        qty[1] ? (decimalSeparator + qty[1]) : ''
      ];

      component.rowClassName = '';

      if (component.validFrom)
      {
        var validFrom = time.utc.getMoment(component.validFrom);

        component.validFrom = validFrom.format('L');

        if (Math.abs(validFrom.diff(Date.now(), 'days')) < 30)
        {
          component.rowClassName += ' is-recent';
        }
      }

      components.push(component);

      var newComponents = oldToNew[component.nc12];

      if (newComponents)
      {
        colored = true;
        component.rowClassName += ' danger';

        newComponents.forEach(function(compRel)
        {
          compRel.newComponents.forEach(function(newComponent)
          {
            components.push({
              compRel: true,
              rowClassName: 'success',
              orderNo: component.orderNo,
              mrp: component.mrp,
              nc12: newComponent._id,
              name: newComponent.name,
              releasedAt: time.format(compRel.releasedAt, 'L HH:mm'),
              releasedBy: userInfoTemplate({userInfo: compRel.releasedBy, noIp: true})
            });
          });
        });

        return;
      }

      var oldComponents = newToOld[component.nc12];

      if (oldComponents)
      {
        colored = true;
        component.rowClassName += ' success';

        oldComponents.forEach(function(old)
        {
          var compRel = old.compRel;

          component.releasedAt = time.format(compRel.releasedAt, 'L HH:mm');
          component.releasedBy = userInfoTemplate({userInfo: compRel.releasedBy, noIp: true});

          components.push({
            compRel: true,
            rowClassName: 'danger',
            orderNo: component.orderNo,
            mrp: component.mrp,
            nc12: old.oldComponent._id,
            name: old.oldComponent.name
          });
        });
      }
    });

    if (extraCompRels.length)
    {
      colored = true;

      extraCompRels.forEach(compRel =>
      {
        compRel.newComponents.forEach(newComponent =>
        {
          components.unshift({
            compRel: true,
            rowClassName: 'success',
            orderNo: '',
            mrp: '',
            nc12: newComponent._id,
            name: newComponent.name,
            releasedAt: time.format(compRel.releasedAt, 'L HH:mm'),
            releasedBy: compRel.releasedBy.label
          });
        });
      });
    }

    return {
      colored: colored,
      components: components
    };
  };
});
