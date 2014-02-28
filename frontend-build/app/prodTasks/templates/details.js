define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(s){return String(s).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    ',t("prodTasks","PANEL:TITLE:details"),'\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">',t("prodTasks","PROPERTY:name"),'</div>\n        <div class="prop-value">',escape(model.name),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("prodTasks","PROPERTY:tags"),'</div>\n        <div class="prop-value">',escape(model.tags.length?model.tags.join(", "):"-"),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("prodTasks","PROPERTY:fteDiv"),'</div>\n        <div class="prop-value">',escape(t("core","BOOL:"+model.fteDiv)),'</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">',t("prodTasks","PROPERTY:clipColor"),'</div>\n        <div class="prop-value">\n          '),model.clipColor?buf.push('\n          <span class="label" style="background: ',model.clipColor,'">',model.clipColor,"</span>\n          "):buf.push("\n          -\n          "),buf.push("\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});