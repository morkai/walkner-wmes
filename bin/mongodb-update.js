/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var vendors = {};

db.pfepentries.find({}, {unit: 1, packType: 1, vendor: 1}).forEach(({_id, unit, packType, vendor}) =>
{
  packType = packType.toLowerCase().trim();

  if (/ipp/.test(packType))
  {
    packType = 'ipp pallet';
  }
  else if (/^pall?eta?$/.test(packType))
  {
    packType = 'pallet';
  }
  else if (/(carton|car[td]board)/.test(packType))
  {
    packType = 'cardboard box';
  }
  else if (/^bo[xs]$/.test(packType))
  {
    packType = 'box';
  }
  else if (/undle$/.test(packType))
  {
    packType = 'bundle';
  }

  unit = unit.toLowerCase().trim();

  if (unit === 'pcs' || unit === 'szt' || unit === '')
  {
    unit = 'pce';
  }

  vendor = vendor.trim().replace(/\s+/g, ' ');

  if (/(pok.j|ryn)/i.test(vendor))
  {
    vendor = 'Pokój Ryn';
  }
  else if (/Akces.*?Bis/i.test(vendor))
  {
    vendor = 'Akces-Bis';
  }
  else if (/Bart.*?Druk/i.test(vendor))
  {
    vendor = 'Bart-Druk';
  }
  else if (/Gaz.*?Tech/i.test(vendor))
  {
    vendor = 'Gaz-Tech';
  }
  else if (/Carclo/i.test(vendor))
  {
    vendor = 'Carclo Optics';
  }
  else if (/Chun\s*Xing/i.test(vendor))
  {
    vendor = 'Chun Xing';
  }
  else if (/All In Plast/i.test(vendor))
  {
    vendor = 'All In Plast';
  }
  else if (/Lucy Zodion/i.test(vendor))
  {
    vendor = 'Lucy Zodion';
  }
  else if (/M3 Profile/i.test(vendor))
  {
    vendor = 'M3 Profile';
  }
  else if (/Shun\s*Fu/i.test(vendor))
  {
    vendor = 'Shun Fu';
  }
  else if (/Nordic Alu/i.test(vendor))
  {
    vendor = 'Nordic Aluminium';
  }
  else if (/^Szk.o$/i.test(vendor))
  {
    vendor = 'Szkło';
  }
  else if (/Szlif\s*Gl/i.test(vendor))
  {
    vendor = 'Szlif Glass';
  }
  else if (/(48006789|colorex)/i.test(vendor))
  {
    vendor = '48006789 ABC COLOREX sp. z o.o.';
  }
  else if (/34108050/.test(vendor))
  {
    vendor = '34108050 SILICONAS SILAM S.A.';
  }
  else if (/48003382/.test(vendor))
  {
    vendor = '48003382 MIKROSTYK S.A.';
  }
  else if (/(48004205|Tele.?Max)/i.test(vendor))
  {
    vendor = '48003382 TELE-MAX Przedsiębiorstwo Wielobranżowe';
  }
  else if (/^(TE|TE Conn.*?)$/i.test(vendor))
  {
    vendor = 'TE Connectivity';
  }
  else if (/^ENT$/i.test(vendor))
  {
    vendor = 'ENT';
  }
  else if (/^Wieland$/i.test(vendor))
  {
    vendor = 'Wieland';
  }
  else if (/^Botai/i.test(vendor))
  {
    vendor = 'Botai';
  }
  else if (/^Saeta/i.test(vendor))
  {
    vendor = 'Saeta';
  }
  else if (/^Opulent/i.test(vendor))
  {
    vendor = 'Opulent';
  }

  db.pfepentries.updateOne({_id}, {$set: {unit, packType, vendor}});
});
