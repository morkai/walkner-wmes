define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="suggestions-report-engagement-tables">\r\n  '),groups.length||(__append('\r\n  <p class="well">'),__append(t("engagement:empty")),__append("</p>\r\n  ")),__append("\r\n  "),groups.forEach(function(n){__append("\r\n    <h3>"),__append(formatHeader(n.key)),__append('</h3>\r\n    <table class="stripe order-column cell-border">\r\n      <thead>\r\n      <tr>\r\n        <th>'),__append(t("engagement:name")),__append("</th>\r\n        "),counters.forEach(function(n){__append("\r\n          <th>"),__append(t("engagement:"+n)),__append("</th>\r\n        ")}),__append("\r\n        <th>"),__append(t("engagement:sections")),__append('</th>\r\n      </tr>\r\n      </thead>\r\n      <tfoot>\r\n      <tr>\r\n        <td class="text-right">\r\n          '),__append(t("engagement:total:entries")),__append("\r\n          <br>\r\n          "),__append(t("engagement:total:users")),__append("\r\n        </td>\r\n        "),counters.forEach(function(e){__append('\r\n          <td class="is-number">\r\n            '),__append(n.totals[e].toLocaleString()),__append("\r\n            <br>\r\n            "),__append(n.totals.users[e].toLocaleString()),__append("\r\n          </td>\r\n        ")}),__append("\r\n        <td></td>\r\n      </tr>\r\n      </tfoot>\r\n      <tbody>\r\n      "),n.users.forEach(function(n){__append("\r\n        <tr>\r\n          <td>"),__append(escapeFn(n.name)),__append("</td>\r\n          "),counters.forEach(function(e){__append('\r\n            <td class="is-number">'),__append(n[e].toLocaleString()),__append("</td>\r\n          ")}),__append("\r\n          <td>"),__append(n.sections.join("; ")),__append("</td>\r\n        </tr>\r\n      ")}),__append("\r\n      </tbody>\r\n    </table>\r\n  ")}),__append("\r\n</div>\r\n");return __output}});