define(["../core/Collection","./ProdTask"],function(r,t){"use strict";return r.extend({model:t,rqlQuery:"sort(name)",sort:function(r){var t,e=[],i={};for(t=0;t<this.length;++t){var n=this.models[t],s=n.attributes;s.parent?i[s.parent]?i[s.parent].push(n):i[s.parent]=[n]:e.push(n)}var h=[];for(t=0;t<e.length;++t){var a=e[t];h.push(a),l(a)}return this.models=h,r&&!r.silent&&this.trigger("sort",this,r||{}),this;function l(r){if(r.children=i[r.id]||[],r.children.length)for(var t=0;t<r.children.length;++t){var e=r.children[t];h.push(e),l(e)}}},serializeToSelect2:function(r){var t=[];return this.sort().forEach(function(e){e.id===r||e.attributes.parent||t.push({id:e.id,text:e.getLabel(),children:function t(e){var i=[];if(Array.isArray(e.children))for(var n=0;n<e.children.length;++n){var s=e.children[n];s.id!==r&&i.push({id:s.id,text:s.getLabel(),children:t(s),prodTask:s})}return i}(e),prodTask:e})}),t}})});