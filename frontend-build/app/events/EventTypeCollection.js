define(["../i18n","../core/Collection","./EventType"],function(e,n,t){return n.extend({model:t,parse:function(n){return n.map(function(n){return{value:n,label:e.bound("events","TYPE:"+n)}})}})});