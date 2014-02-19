define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<table class="table table-bordered table-condensed fte-leaderEntry-print">\n  <thead>\n    <tr>\n      <th>',t("fte","leaderEntry:column:task"),"</th>\n      <th>",t("fte","leaderEntry:column:taskTotal"),"</th>\n      "),companies.forEach(function(n){buf.push('\n      <th colspan="',divisions.length,'">',escape(n.name),"</th>\n      ")}),buf.push('\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th class="fte-ntb fte-nbb"></th>\n      <th class="fte-nbb">',round(total),"</th>\n      "),companies.forEach(function(n){buf.push('\n      <th class="fte-nbb" colspan="',divisions.length,'">',round(n.total),"</th>\n      ")}),buf.push("\n    </tr>\n    "),divisions.length&&(buf.push('\n    <tr>\n      <th class="fte-ntb"></th>\n      <th class="fte-ntb"></th>\n      '),companies.forEach(function(){buf.push("\n      "),divisions.forEach(function(n){buf.push("\n      <th>",n,"</th>\n      ")}),buf.push("\n      ")}),buf.push("\n    </tr>\n    ")),buf.push("\n    "),tasks.forEach(function(n){buf.push("\n    <tr>\n      <td>",escape(n.name),"\n      <td>",round(n.total),"\n      "),n.companies.forEach(function(n){buf.push("\n      "),Array.isArray(n.count)?(buf.push("\n      "),n.count.forEach(function(n){buf.push("\n      <td>",n.value,"</td>\n      ")}),buf.push("\n      ")):buf.push('\n      <td colspan="',divisions.length,'">',n.count,"</td>\n      "),buf.push("\n      ")}),buf.push("\n    </tr>\n    ")}),buf.push("\n  </tbody>\n</table>\n")}();return buf.join("")}});