/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.qikinds.updateMany({}, {$set: {position: 0}});

const kinds = [
  {
    "_id": "570ad89c06c446d0ba410364",
    "name": "Proces - kompletacja komponentów",
    "position": 8000
  },
  {
    "_id": "570ad89c06c446d0ba410365",
    "name": "Wyrób - magazyn wyrobów gotowych",
    "position": 3000
  },
  {
    "_id": "570ad89c06c446d0ba410366",
    "name": "Proces - montaż",
    "position": 5000
  },
  {
    "_id": "570ad89c06c446d0ba410367",
    "name": "Wyrób",
    "position": 1000
  },
  {
    "_id": "5808c73b7fcea814c4a0277a",
    "name": "Kompletacja komponentów",
    "position": 9000
  },
  {
    "_id": "5bb5f268108d460760773146",
    "name": "Szkolenie - ogólne dla nowych pracowników",
    "position": 11000
  },
  {
    "_id": "5bb607fb5f49f5143454cbd8",
    "name": "Proces - montaż - ETO pilot",
    "position": 7000
  },
  {
    "_id": "5bb608265f49f5143454cbdc",
    "name": "Proces - montaż - SPC",
    "position": 6000
  },
  {
    "_id": "5bb6083f5f49f5143454cbde",
    "name": "Wyrób gotowy - zwrot transportowy",
    "position": 4000
  },
  {
    "_id": "5bb6085c5f49f5143454cbe0",
    "name": "Szkolenie jakościowe - trenerskie",
    "position": 10000
  },
  {
    "_id": "5bea949148c585162400b1df",
    "name": "Wyrób - seria próbna",
    "position": 2000
  }
];

kinds.forEach(k =>
{
  db.qikinds.updateOne({_id: new ObjectId(k._id)}, {$set: {position: k.position}});
});
