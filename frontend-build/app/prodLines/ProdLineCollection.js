define(["../user","../core/Collection","./ProdLine"],function(e,t,n){return t.extend({model:n,rqlQuery:"select(workCenter,description)&sort(workCenter,_id)",getForCurrentUser:function(){var t=e.getDivision(),n=e.getSubdivision();return this.filter(function(r){if(e.data.super||!t)return!0;if(n)return r.get("subdivision")===n.id;var i=r.getSubdivision();if(!i)return!0;var o=i.getDivision();return o?o===t:!0})}})});