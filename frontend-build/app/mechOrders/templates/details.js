define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary mechOrders-details">\n  <div class="panel-heading">\n    ',t("mechOrders","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("mechOrders","PROPERTY:_id"),'</div>\n        <div class="prop-value">',escape(model._id),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("mechOrders","PROPERTY:name"),'</div>\n        <div class="prop-value">',escape(model.name||"-"),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("mechOrders","PROPERTY:mrp"),'</div>\n        <div class="prop-value">',escape(model.mrp||"-"),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("mechOrders","PROPERTY:importTs"),'</div>\n        <div class="prop-value">',escape(model.importTs||"-"),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});