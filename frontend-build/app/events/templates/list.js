define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="list">\n  <table class="table table-bordered table-hover table-condensed">\n    <thead>\n      <tr>\n        <th>',t("events","PROPERTY:time"),"\n        <th>",t("events","PROPERTY:type"),"\n        <th>",t("events","PROPERTY:user"),"\n        <th>",t("events","PROPERTY:text"),"\n      </tr>\n    </thead>\n    <tbody>\n      "),events.forEach(function(e){buf.push('\n      <tr class="list-item ',e.severity,'">\n        <td>',e.time,"\n        <td>",e.type,"\n        <td>\n          "),e.user?(buf.push("\n            "),"root"===e.user.login?buf.push("\n              ",e.user.login,"\n            "):buf.push('\n              <a href="#users/',e.user._id,'">',e.user.name,"</a>\n            "),buf.push("\n            "),e.user.ipAddress&&buf.push("(",e.user.ipAddress,")"),buf.push("\n          ")):buf.push("\n            -\n          "),buf.push("\n        <td>",e.text,"\n      </tr>\n      ")}),buf.push('\n    </tbody>\n  </table>\n  <div class="pagination-container"></div>\n</div>\n')}();return buf.join("")}});