// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./ProdTask"],function(r,t){"use strict";return r.extend({model:t,rqlQuery:"sort(name)",sort:function(r){function t(r){if(r.children=n[r.id]||[],r.children.length)for(var e=0;e<r.children.length;++e){var i=r.children[e];a.push(i),t(i)}}var e,i=[],n={};for(e=0;e<this.length;++e){var s=this.models[e],h=s.attributes;h.parent?n[h.parent]?n[h.parent].push(s):n[h.parent]=[s]:i.push(s)}var a=[];for(e=0;e<i.length;++e){var l=i[e];a.push(l),t(l)}return this.models=a,r&&!r.silent&&this.trigger("sort",this,r||{}),this},serializeToSelect2:function(r){function t(e){var i=[];if(Array.isArray(e.children))for(var n=0;n<e.children.length;++n){var s=e.children[n];s.id!==r&&i.push({id:s.id,text:s.getLabel(),children:t(s),prodTask:s})}return i}var e=[];return this.sort().forEach(function(i){i.id===r||i.attributes.parent||e.push({id:i.id,text:i.getLabel(),children:t(i),prodTask:i})}),e}})});