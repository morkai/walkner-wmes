// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../core/Collection","./MrpController"],function(r,e,i){"use strict";return e.extend({model:i,rqlQuery:"sort(_id)",comparator:"_id",getForCurrentUser:function(){var e=r.getDivision(),i=r.getSubdivision();return this.filter(function(t){if(r.data["super"]||!e||"prod"!==e.get("type"))return!0;var n=t.getSubdivision();if(!n)return!0;if(i)return n.id===i.id;var o=n.get("division");return o?o===e.id:!0})}})});