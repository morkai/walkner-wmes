define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-default pos-changes">\n  <div class="panel-heading">',t("purchaseOrders","panel:changes"),'</div>\n  <table class="table table-bordered table-hover">\n    <thead>\n      <tr>\n        <th>',t("purchaseOrders","PROPERTY:changes.date"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:changes.property"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:changes.oldValue"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:changes.newValue"),"</th>\n      </tr>\n    </thead>\n    <tbody>\n      "),changes.forEach(function(e,n){buf.push("\n      "),hidden&&1===n&&changes.length>3&&buf.push('\n      <tr>\n        <td id="',idPrefix,'-more" colspan="999" class="pos-changes-more">',t("purchaseOrders","changes:more"),"</td>\n      </tr>\n      "),buf.push('\n      <tr class="',e.visible?"":"hidden",'">\n        <td colspan="999" class="pos-rowSeparator"></td>\n      </tr>\n      <tr class="pos-changes-change ',e.visible?"":"hidden",'">\n        <td rowspan="',e.properties.length,'" class="pos-changes-date">',e.date,"</td>\n        <td>",e.properties[0].name,"</td>\n        <td>",e.properties[0].oldValue,'</td>\n        <td class="pos-changes-change-value" data-property="',e.properties[0].key,'">',e.properties[0].newValue,"</td>\n      </tr>\n      "),e.properties.forEach(function(n,a){buf.push("\n      "),0!==a&&buf.push('\n      <tr class="pos-changes-change-next ',e.visible?"":"hidden",'">\n        <td>',n.name,"</td>\n        <td>",n.oldValue,'</td>\n        <td class="pos-changes-change-value" data-property="',n.key,'">',n.newValue,"</td>\n      </tr>\n      ")}),buf.push("\n      ")}),buf.push("\n    </tbody>\n  </table>\n</div>\n")}();return buf.join("")}});