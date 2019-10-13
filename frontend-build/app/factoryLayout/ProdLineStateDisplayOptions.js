define(["underscore","../user","../core/Model","../data/orgUnits","../data/localStorage"],function(t,i,s,e,n){"use strict";return s.extend({defaults:function(){return{orgUnitType:null,orgUnitIds:null,statuses:["online","offline"],states:["idle","working","downtime"],blacklisted:!1,from:null,to:null,shifts:["1","2","3"]}},serializeToString:function(){var t=this.attributes,i="statuses="+t.statuses+"&states="+t.states+"&orgUnitType="+t.orgUnitType+"&orgUnitIds="+(t.orgUnitIds||[]).map(encodeURIComponent);return t.blacklisted&&(i+="&blacklisted=1"),t.from&&t.to&&(i+="&from="+t.from+"&to="+t.to+"&shifts="+t.shifts),i},isVisible:function(t){if(this.isHistoryData())return!0;var i=this.attributes;return-1!==i.statuses.indexOf(t.get("online")?"online":"offline")&&-1!==i.states.indexOf(t.get("state")||"idle")&&e.containsProdLine(i.orgUnitType,i.orgUnitIds,t.id)},save:function(){n.setItem("ProdLineStateDisplayOptions",JSON.stringify(this.attributes))},haveHistoryOptionsChanged:function(){var t=this.changedAttributes();return void 0!==t.from||void 0!==t.to||void 0!==t.shifts||void 0!==t.orgUnitIds},isHistoryData:function(){return null!==this.attributes.from&&null!==this.attributes.to}},{fromQuery:function(s){var e={orgUnitType:s.orgUnitType,orgUnitIds:s.orgUnitIds?s.orgUnitIds.split(","):void 0,statuses:s.statuses?s.statuses.split(","):void 0,states:s.states?s.states.split(","):void 0,blacklisted:void 0===s.blacklisted?void 0:"1"===s.blacklisted,from:parseInt(s.from,10)||void 0,to:parseInt(s.to,10)||void 0,shifts:s.shifts?s.shifts.split(","):void 0},o=n.getItem("ProdLineStateDisplayOptions");return o&&t.defaults(e,JSON.parse(o)),e.orgUnitType||(i.data.orgUnitType?(e.orgUnitType=i.data.orgUnitType,e.orgUnitIds=[i.data.orgUnitId]):(e.orgUnitType="prodLine",e.orgUnitIds=[])),new this(e)}})});