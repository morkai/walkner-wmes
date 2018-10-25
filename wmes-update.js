/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.pfepentries.find({}, {packType: 1}).forEach(d =>
{
  if (!/^[A-Z]+$/i.test(d.packType))
  {
    return;
  }

  var packType = d.packType.toLowerCase();

  db.pfepentries.updateOne({_id: d._id}, {$set: {
    packType: packType.substring(0, 1).toUpperCase() + packType.substring(1)
  }})
});

db.paintshoporders.aggregate([{$group: {_id: '$order'}}]).forEach(r =>
{
  const sapOrder = db.orders.findOne({_id: r._id}, {leadingOrder: 1});

  if (!sapOrder)
  {
    return;
  }

  const sapOrders = !sapOrder.leadingOrder ? [sapOrder] : db.orders.find({
    $or: [
      {_id: sapOrder.leadingOrder},
      {leadingOrder: sapOrder.leadingOrder}
    ]
  }, {leadingOrder: 1}).toArray();

  const psOrders = db.paintshoporders.find({order: {$in: sapOrders.map(o => o._id)}}, {status: 1}).toArray();

  const statuses = {
    new: 0,
    started: 0,
    partial: 0,
    finished: 0,
    cancelled: 0
  };

  psOrders.forEach(o => statuses[o.status] += 1);

  let newStatus = 'new';

  if (statuses.partial)
  {
    newStatus = 'partial';
  }
  else if (statuses.started)
  {
    newStatus = 'started';
  }
  else if (statuses.finished)
  {
    newStatus = (statuses.finished + statuses.cancelled) === psOrders.length ? 'finished' : 'partial';
  }
  else if (statuses.cancelled === psOrders.length)
  {
    newStatus = 'cancelled';
  }

  const eventOrder = sapOrders.find(o => o._id === sapOrder._id);
  const leadingOrder = sapOrders.find(o => o._id === o.leadingOrder);

  db.orders.updateOne({_id: eventOrder._id}, {$set: {psStatus: newStatus}, $unset: {status: 1}});

  if (leadingOrder && eventOrder !== leadingOrder)
  {
    db.orders.updateOne({_id: leadingOrder._id}, {$set: {psStatus: newStatus}, $unset: {status: 1}});
  }
});
