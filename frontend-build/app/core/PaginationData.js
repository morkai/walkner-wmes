define(["underscore","backbone"],function(t,i){return i.Model.extend({defaults:{totalCount:-1,urlTemplate:"?page=${page}&limit=${limit}",page:1,skip:0,limit:10},initialize:function(){this.on("change",this.recalcAttrs,this);var t=this.attributes;t.page<1&&(t.page=1),t.skip<0&&(t.skip=0),t.limit<1&&(t.limit=1),0!==t.skip?this.recalcPage():1!==t.page?this.recalcSkip():this.adjustSkipToLimit()},sync:function(){throw new Error("Not supported!")},recalcAttrs:function(){var i=this.changedAttributes();t.has(i,"total")||t.has(i,"skip")||t.has(i,"limit")?this.recalcPage():t.has(i,"page")&&this.recalcSkip()},recalcPage:function(){this.adjustSkipToLimit();var t=this.attributes;t.page=t.skip/t.limit+1},recalcSkip:function(){var t=this.attributes;t.skip=(t.page-1)*t.limit},adjustSkipToLimit:function(){var t=this.attributes;t.skip>=t.total&&(t.skip=t.total<2?1:t.total-1);var i=t.skip%t.limit;0!==i&&(t.skip-=i)}})});