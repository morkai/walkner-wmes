/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.paintshoporders.find({}).forEach(psOrder =>
{
  psOrder.childOrders.forEach(childOrder =>
  {
    var sapOrder = db.orders.findOne({_id: childOrder.order}, {bom: 1});

    if (!sapOrder)
    {
      childOrder.components.forEach(component =>
      {
        component.item = '';
      });

      return;
    }

    var codeToItem = {};

    sapOrder.bom.forEach(component =>
    {
      codeToItem[component.nc12] = component.item;
    });

    childOrder.components.forEach(component =>
    {
      component.item = codeToItem[component.nc12] || '';
    });
  });

  db.paintshoporders.updateOne({_id: psOrder._id}, {$set: {childOrders: psOrder.childOrders}});
});
