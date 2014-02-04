define(["app/i18n","app/time","app/data/aors","app/data/downtimeReasons","app/core/views/ListView","i18n!app/nls/production"],function(t,e,o,i,n){return n.extend({localTopics:{"downtimeReasons.synced":"render","aors.synced":"render"},remoteTopics:function(){var t={};return this.options.prodLine&&(t["prodDowntimes.corroborated."+this.options.prodLine]="onCorroborated"),t},initialize:function(){n.prototype.initialize.apply(this,arguments),this.listenTo(this.collection,"add",this.render),this.listenTo(this.collection,"change",this.render),this.listenTo(this.collection,"remove",this.render)},serializeColumns:function(){return[{id:"startedAt",label:t("production","prodDowntime:startedAt")},{id:"finishedAt",label:t("production","prodDowntime:finishedAt")},{id:"reason",label:t("production","prodDowntime:reason")},{id:"aor",label:t("production","prodDowntime:aor")}]},serializeRows:function(){return this.collection.map(function(t){var n=t.toJSON(),r=o.get(n.aor),s=i.get(n.reason);return n.className=t.getCssClassName(),n.startedAt=e.format(n.startedAt,"YYYY-MM-DD HH:mm:ss"),n.finishedAt=n.finishedAt?e.format(n.finishedAt,"YYYY-MM-DD HH:mm:ss"):"-",r&&(n.aor=r.get("name")),s&&(n.reason=s.get("label")),n})},serializeActions:function(){return[]},onCorroborated:function(t){var e=this.collection.get(t._id);e&&(e.set(t),this.trigger("corroborated",t._id))}})});