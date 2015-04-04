// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../core/Collection","./ProdLine"],function(e,r,i){"use strict";return r.extend({model:i,rqlQuery:"select(workCenter,description,inventoryNo,deactivatedAt)&sort(workCenter,_id)",comparator:"_id",getForCurrentUser:function(){var r=e.getDivision(),i=e.getSubdivision();return this.filter(function(t){if(e.data["super"]||!r)return!0;var n=t.getSubdivision();if(!n)return!0;if(i)return n.id===i.id;var o=n.get("division");return o?o===r.id:!0})}})});