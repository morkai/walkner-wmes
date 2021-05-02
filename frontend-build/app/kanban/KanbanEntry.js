define(["underscore","../core/Model"],function(n,t){"use strict";return t.extend({urlRoot:"/kanban/entries",clientUrlRoot:"#kanban/entries",topicPrefix:"kanban.entries",privilegePrefix:"KANBAN",nlsDomain:"kanban",initialize:function(){this.serialized=null},split:function(){var t=this,i=t.constructor,e=[t];return(t.get("children")||[]).forEach(function(o,a){e.push(new i(n.defaults({_id:parseFloat(t.id+"."+(a+1)),changes:[],children:[]},o,t.attributes)))}),e},serialize:function(n){if(this.serialized)return this.serialized;var t=this.toJSON(),i=n.supplyAreas.findByWorkCenters(t.supplyArea,t.workCenter?[t.workCenter]:[]),e=n.components.get(t.nc12);t.rowClassName=t.discontinued?"kanban-is-discontinued":"",t.kanbanStorageBin=t.storageBin,e?(t.description=e.get("description"),t.minBinQty=e.get("minBinQty"),t.maxBinQty=e.get("maxBinQty"),t.replenQty=e.get("replenQty"),t.unit=e.get("unit"),153===t.storageType?t.storageBin="":t.storageBin=e.get("storageBin")):(t.description="",t.storageBin="",t.minBinQty=0,t.maxBinQty=0,t.replenQty=0,t.unit="PCE"),t.storageBin?(t.storageBinRow=t.storageBin.substr(1,1),t.markerColor=n.settings.getRowColor(t.storageBinRow)):(t.storageBinRow="",t.markerColor=null),i?(t.supplyAreaId=i.id,t.workCenter=i.get("workCenter"),t.family=i.get("family"),t.lineCount=i.get("lineCount"),t.lines=i.get("lines")):(t.supplyAreaId=null,t.family="",t.lineCount=0,t.lines=[]),t.workstationsTotal=0,t.invalidWorkstations=!1,t.invalidLocations=!1;for(var o=0;o<t.workstations.length;++o){var a=t.workstations[o],r=t.locations[o];t.workstationsTotal+=a,t.invalidWorkstations=t.invalidWorkstations||!a&&!!r,t.invalidLocations=t.invalidLocations||!r&&!!a}return t.workstationsTotal||(t.invalidWorkstations=!0,t.invalidLocations=!0),t.kanbanQtyUser=2*t.workstationsTotal,t.emptyFullCount=t.lineCount*t.kanbanQtyUser,t.stock=t.emptyFullCount*t.componentQty,t.kanbanIdCount=t.kanbanId.length,this.serialized=t}})});