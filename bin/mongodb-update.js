/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.settings.insertOne({
  _id: "xiconf.importer.componentPatterns",
  value: "*PROGRAM*EB*\nPCB*R\nPCBA*\nPCB C*\n*PCB*LEDGINE*\nROUND PCB*TIM\nWASH*PCB*\nPCB*LG*\nPCB*LUMA*\nPCB*LER*\nPCB Road*\n*LED*line*\n*LBA*\nETO PC-AMBER*\nLEDGINE*LUXEON*\nCDM-T*W*\nHPI-T*W*\nHalogen*W*\nMASTER*W*\nMST*W*\nSON-T*W*\n442710250830*\n*OSLON*\n*PCB*LED*\n*Coral*PCB*\n\n-*Wiring*\n-*Harness*\n-PCB*LABEL*\n-*CONNECTOR*\n-*TRAY*",
  updater: null,
  updatedAt: new Date("2019-03-13T11:58:26.337Z")
});
