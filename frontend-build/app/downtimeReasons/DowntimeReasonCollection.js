define(["underscore","../core/Collection","./DowntimeReason"],function(i,n,e){"use strict";return n.extend({model:e,rqlQuery:"sort(_id)",comparator:"_id",findBySubdivisionType:function(n){return Array.isArray(n)?this.filter(function(e){return i.some(e.get("subdivisionTypes"),function(e){return i.includes(n,e)})}):this.filter(function(i){return-1!==i.get("subdivisionTypes").indexOf(n)})},findFirstBreakIdBySubdivisionType:function(i){var n=this.find(function(n){return"break"===n.get("type")&&-1!==n.get("subdivisionTypes").indexOf(i)});return n?n.id:null}})});