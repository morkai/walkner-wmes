// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../core/Collection","./ProdLine"],function(e,r,i){return r.extend({model:i,rqlQuery:"select(workCenter,description,inventoryNo)&sort(workCenter,_id)",getForCurrentUser:function(){var r=e.getDivision(),i=e.getSubdivision();return this.filter(function(n){if(e.data.super||!r)return!0;var t=n.getSubdivision();if(!t)return!0;if(i)return t.id===i.id;var o=t.get("division");return o?o===r.id:!0})}})});