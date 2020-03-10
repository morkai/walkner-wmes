define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="list">\n  <div class="table-responsive">\n    <table class="table '),__append(tableClassName),__append('">\n      <thead>\n      <tr>\n        <th class="is-min" rowspan="2">'),__append(t("PROPERTY:_id")),__append('</th>\n        <th class="is-min" colspan="3">'),__append(t("PROPERTY:pickup")),__append('</th>\n        <th class="is-min" colspan="2">'),__append(t("PROPERTY:components")),__append('</th>\n        <th rowspan="2"></th>\n      </tr>\n      <tr>\n        <td class="is-min">'),__append(t("PROPERTY:sets")),__append('</td>\n        <td class="is-min">'),__append(t("PROPERTY:qty")),__append('</td>\n        <td class="is-min">'),__append(t("PROPERTY:time")),__append('</td>\n        <td class="is-min">'),__append(t("PROPERTY:qty")),__append('</td>\n        <td class="is-min">'),__append(t("PROPERTY:time")),__append("</td>\n      </tr>\n      </thead>\n      <tbody>\n        "),rows.length||(__append('\n        <tr>\n          <td colspan="7">'),__append(noData),__append("</td>\n        </tr>\n        ")),__append("\n        "),rows.forEach(function(n){__append("\n        "),__append(renderRow({row:n})),__append("\n        ")}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="pagination-container"></div>\n</div>\n');return __output}});