define(["../user","../core/Collection","./ProdLine"],function(e,r,t){"use strict";return r.extend({model:t,rqlQuery:"select(workCenter,description,inventoryNo,deactivatedAt)&sort(workCenter,_id)",getForCurrentUser:function(){var r=e.getDivision(),t=e.getSubdivision();return this.filter(function(i){if(e.data.super||!r||"prod"!==r.get("type"))return!0;var n=i.getSubdivision();if(!n)return!0;if(t)return n.id===t.id;var o=n.get("division");return!o||o===r.id})}})});