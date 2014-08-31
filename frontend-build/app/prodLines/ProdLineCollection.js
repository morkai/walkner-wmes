// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../core/Collection","./ProdLine"],function(r,e,i){return e.extend({model:i,rqlQuery:"select(workCenter,description,inventoryNo)&sort(workCenter,_id)",comparator:"_id",getForCurrentUser:function(){var e=r.getDivision(),i=r.getSubdivision();return this.filter(function(t){if(r.data.super||!e)return!0;var n=t.getSubdivision();if(!n)return!0;if(i)return n.id===i.id;var o=n.get("division");return o?o===e.id:!0})}})});