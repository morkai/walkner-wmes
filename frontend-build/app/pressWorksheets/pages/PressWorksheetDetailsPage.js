define(["app/user","app/core/util/pageActions","app/core/pages/DetailsPage","../PressWorksheetCollection","../views/PressWorksheetDetailsView"],function(e,t,i,s,o){"use strict";return i.extend({DetailsView:o,actions:function(i){var o=Date.now(),r=[t.export(i,this,new s(null,{rqlQuery:"_id="+this.model.id}))];return(e.isAllowedTo("PROD_DATA:MANAGE")||e.data._id===this.model.get("creator").id&&Date.parse(this.model.get("createdAt"))+288e5>o)&&r.push(t.edit(this.model),t.delete(this.model)),r}})});