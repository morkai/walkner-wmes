define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed fte-leaderEntry-print">\n  <thead>\n    <tr>\n      <th>'),__append(t("fte","leaderEntry:column:task")),__append("</th>\n      <th>"),__append(t("fte","leaderEntry:column:taskTotal")),__append("</th>\n      "),companies.forEach(function(n){__append('\n      <th colspan="'),__append(divisions.length),__append('">'),__append(escape(n.name)),__append("</th>\n      ")}),__append('\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th class="fte-ntb fte-nbb"></th>\n      <th class="fte-nbb">'),__append(round(total)),__append("</th>\n      "),companies.forEach(function(n,p){__append('\n      <th class="fte-nbb" colspan="'),__append(divisions.length),__append('">'),__append(round(n.total)),__append("</th>\n      ")}),__append("\n    </tr>\n    "),divisions.length&&(__append('\n    <tr>\n      <th class="fte-ntb"></th>\n      <th class="fte-ntb"></th>\n      '),companies.forEach(function(n,p){__append("\n      "),divisions.forEach(function(n){__append("\n      <th>"),__append(n),__append("</th>\n      ")}),__append("\n      ")}),__append("\n    </tr>\n    ")),__append("\n    "),tasks.forEach(function(n,p){__append("\n    <tr>\n      <td>"),__append(escape(n.name)),__append("\n      <td>"),__append(round(n.total)),__append("\n      "),n.companies.forEach(function(n,p){__append("\n      "),Array.isArray(n.count)?(__append("\n      "),n.count.forEach(function(n,p){__append("\n      <td>"),__append(round(n.value)),__append("</td>\n      ")}),__append("\n      ")):(__append('\n      <td colspan="'),__append(divisions.length),__append('">'),__append(round(n.count)),__append("</td>\n      ")),__append("\n      ")}),__append("\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});