/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhevents.find({'data.setCarts': {$exists: true}}, {objects: 1, 'data.setCarts': 1}).forEach(event =>
{
  event.data.setCarts.forEach(setCart =>
  {
    if (!event.objects.includes(`cart-${setCart.cart}`))
    {
      event.objects.push(`cart-${setCart.cart}`);
    }

    if (!event.objects.includes(`cart-${setCart.kind}-${setCart.cart}`))
    {
      event.objects.push(`cart-${setCart.kind}-${setCart.cart}`);
    }
  });

  db.oldwhevents.updateOne({_id: event._id}, {$set: {objects: event.objects}});
});
