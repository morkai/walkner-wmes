define(["underscore","../core/Model"],function(n,t){"use strict";return t.extend({urlRoot:"/kanban/entries",clientUrlRoot:"#kanban/entries",topicPrefix:"kanban.entries",privilegePrefix:"KANBAN",nlsDomain:"kanban",initialize:function(){this.serialized=null},split:function(){var t=this,e=t.constructor,i=[t];return(t.get("children")||[]).forEach(function(o,r){i.push(new e(n.defaults({_id:parseFloat(t.id+"."+(r+1)),changes:[],children:[]},o,t.attributes)))}),i},serialize:function(n){if(this.serialized)return this.serialized;var t=this.toJSON(),e=n.supplyAreas.findByWorkCenters(t.supplyArea,t.workCenter?[t.workCenter]:[]),i=n.components.get(t.nc12);t.rowClassName=t.discontinued?"kanban-is-discontinued":"",t.kanbanStorageBin=t.storageBin,i?(t.description=i.get("description"),t.minBinQty=i.get("minBinQty"),t.maxBinQty=i.get("maxBinQty"),t.replenQty=i.get("replenQty"),t.unit=i.get("unit"),153===t.storageType?(t.storageBin="",t.newStorageBin=""):(t.storageBin=i.get("storageBin"),t.newStorageBin=i.get("newStorageBin"))):(t.description="",t.storageBin="",t.newStorageBin="",t.minBinQty=0,t.maxBinQty=0,t.replenQty=0,t.unit="PCE"),t.storageBin?(t.storageBinRow=t.storageBin.substr(1,1),t.markerColor=n.settings&&n.settings.getRowColor(t.storageBinRow)||null):(t.storageBinRow="",t.markerColor=null),t.newStorageBin?(t.newStorageBinRow=t.newStorageBin.substr(1,1),t.newMarkerColor=n.settings&&n.settings.getRowColor(t.newStorageBinRow)||null):(t.newStorageBinRow="",t.newMarkerColor=null),e?(t.supplyAreaId=e.id,t.workCenter=e.get("workCenter"),t.family=e.get("family"),t.lineCount=e.get("lineCount"),t.lines=e.get("lines")):(t.supplyAreaId=null,t.family="",t.lineCount=0,t.lines=[]),t.workstationsTotal=0,t.invalidWorkstations=!1,t.invalidLocations=!1;for(var o=0;o<t.workstations.length;++o){var r=t.workstations[o],a=t.locations[o];t.workstationsTotal+=r,t.invalidWorkstations=t.invalidWorkstations||!r&&!!a,t.invalidLocations=t.invalidLocations||!a&&!!r}return t.workstationsTotal||(t.invalidWorkstations=!0,t.invalidLocations=!0),t.kanbanQtyUser=2*t.workstationsTotal,t.emptyFullCount=t.lineCount*t.kanbanQtyUser,t.stock=t.emptyFullCount*t.componentQty,t.kanbanIdCount=t.kanbanId.length,this.serialized=t}})});