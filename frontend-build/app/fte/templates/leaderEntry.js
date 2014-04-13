define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="well">\n    <div class="fte-property">\n      <span class="fte-property-name">',t("core","ORG_UNIT:subdivision"),'</span>\n      <span class="fte-property-value">',subdivision,'</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">',t("fte","property:date"),'</span>\n      <span class="fte-property-value">',date,'</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">',t("fte","property:shift"),'</span>\n      <span class="fte-property-value">',shift,'</span>\n    </div>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">',t("fte","leaderEntry:panel:title"+(editable?":editable":"")),"</div>\n    "),editable&&buf.push('\n    <div class="message message-inline message-info">',t("fte","panel:info"),"</div>\n    "),buf.push('\n    <table class="table table-bordered table-condensed table-hover fte-leaderEntry">\n      <thead>\n        <tr>\n          <th class="fte-leaderEntry-column-task" rowspan="3">',t("fte","leaderEntry:column:task"),"\n          <th>",t("fte","leaderEntry:column:taskTotal"),"\n          "),companies.forEach(function(n,t){buf.push('\n          <th class="fte-leaderEntry-column-company" colspan="',divisions.length,'" data-column="',t,'">',escape(n.name),"\n          ")}),buf.push('\n        </tr>\n        <tr>\n          <th class="fte-leaderEntry-total-overall" rowspan="2">',round(total),"\n          "),companies.forEach(function(n,t){buf.push('\n          <th class="fte-leaderEntry-total-company" colspan="',divisions.length,'" data-column="',escape(t),'">',round(n.total),"\n          ")}),buf.push("\n        </tr>\n        "),divisions.length&&(buf.push("\n        <tr>\n          "),companies.forEach(function(n,t){buf.push("\n          "),divisions.forEach(function(n,a){buf.push('\n          <th class="fte-leaderEntry-column-division" data-column="',t,":",a,'">',n,"\n          ")}),buf.push("\n          ")}),buf.push("\n        </tr>\n        ")),buf.push("\n      </thead>\n      <tbody>\n        "),tasks.forEach(function(n,t){buf.push("\n        <tr>\n          <td>",escape(n.name),'\n          <td class="fte-leaderEntry-total-task">',round(n.total),"\n          "),n.companies.forEach(function(n,a){buf.push("\n          "),Array.isArray(n.count)?(buf.push("\n          "),n.count.forEach(function(n,e){buf.push("\n          <td ",editable?"":'class="fte-leaderEntry-count"',">\n            "),editable?buf.push('\n            <input\n              class="form-control no-controls fte-leaderEntry-count"\n              type="number"\n              min="0"\n              max="9999"\n              value="',n.value,'"\n              data-value="',n.value,'"\n              data-task="',t,'"\n              data-company="',a,'"\n              data-division="',e,'">\n            '):buf.push("\n            ",round(n.value),"\n            "),buf.push("\n          </td>\n          ")}),buf.push("\n          ")):(buf.push("\n          <td ",editable?"":'class="fte-leaderEntry-count"',' colspan="',divisions.length,'">\n            '),editable?buf.push('\n            <input\n              class="form-control no-controls fte-leaderEntry-count"\n              type="number"\n              min="0"\n              max="9999"\n              value="',n.count,'"\n              data-value="',n.count,'"\n              data-task="',t,'"\n              data-company="',a,'">\n            '):buf.push("\n            ",round(n.count),"\n            "),buf.push("\n          </td>\n          ")),buf.push("\n          ")}),buf.push("\n        </tr>\n        ")}),buf.push("\n      </tbody>\n    </table>\n  </div>\n</div>\n")}();return buf.join("")}});