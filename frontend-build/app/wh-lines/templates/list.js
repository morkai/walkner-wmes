define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="list is-colored wh-lines-list">\n  <div class="table-responsive">\n    <table class="table '),__append(tableClassName),__append('">\n      <thead>\n      <tr>\n        <th class="is-min wh-lines-group-start" rowspan="2">'),__append(t("PROPERTY:_id")),__append('</th>\n        <th class="is-min wh-lines-group-start" colspan="3">'),__append(t("PROPERTY:pickup:started")),__append('</th>\n        <th class="is-min wh-lines-group-start" colspan="3">'),__append(t("PROPERTY:pickup:finished")),__append('</th>\n        <th class="is-min wh-lines-group-start" colspan="2">'),__append(t("PROPERTY:available")),__append('</th>\n        <th class="is-min" rowspan="2">'),__append(t("PROPERTY:redirLine")),__append('</th>\n        <th class="is-min" rowspan="2">'),__append(t("PROPERTY:working")),__append('</th>\n        <th class="is-min" rowspan="2" style="line-height: 1.2">'),__append(t("LIST:COLUMN:nextShiftAt")),__append('</th>\n        <th class="is-min" rowspan="2">'),__append(t("LIST:COLUMN:startedPlan")),__append('</th>\n        <th rowspan="2">'),__append(t("PROPERTY:mrps")),__append('</th>\n      </tr>\n      <tr>\n        <td class="is-min text-center">'),__append(t("PROPERTY:sets")),__append('</td>\n        <td class="is-min text-center">'),__append(t("PROPERTY:qty")),__append('</td>\n        <td class="is-min text-center wh-lines-group-start">'),__append(t("PROPERTY:time")),__append('</td>\n        <td class="is-min text-center">'),__append(t("PROPERTY:sets")),__append('</td>\n        <td class="is-min text-center">'),__append(t("PROPERTY:qty")),__append('</td>\n        <td class="is-min text-center wh-lines-group-start">'),__append(t("PROPERTY:time")),__append('</td>\n        <td class="is-min text-center">'),__append(t("PROPERTY:qty")),__append('</td>\n        <td class="is-min text-center wh-lines-group-start">'),__append(t("PROPERTY:time")),__append("</td>\n      </tr>\n      </thead>\n      <tbody>\n        "),rows.forEach(function(n){__append("\n        "),__append(renderRow({row:n,canManage:canManage})),__append("\n        ")}),__append('\n        <tr id="'),__append(id("details-outer")),__append('" class="wh-lines-details hidden">\n          <td id="'),__append(id("details-inner")),__append('" colspan="14">?</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="pagination-container"></div>\n</div>\n');return __output}});