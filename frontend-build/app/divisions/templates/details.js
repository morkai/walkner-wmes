define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(i){return String(i).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    ',t("divisions","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("divisions","PROPERTY:_id"),'</div>\n        <div class="prop-value">',escape(model._id),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("divisions","PROPERTY:type"),'</div>\n        <div class="prop-value">',t("divisions","TYPE:"+model.type),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("divisions","PROPERTY:description"),'</div>\n        <div class="prop-value">',escape(model.description),"</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});