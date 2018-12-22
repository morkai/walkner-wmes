define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="reports-2-orders-list is-colored">\n  <div class="table-responsive">\n    <table class="table table-bordered table-condensed table-hover">\n      <thead>\n        <tr>\n          <th class="is-min">'),__append(t("orders","PROPERTY:_id")),__append('</th>\n          <th class="is-min">'),__append(t("orders","PROPERTY:name")),__append('</th>\n          <th class="is-min">'),__append(t("orders","PROPERTY:mrp")),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:qty")),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:cnf:status")),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:dlv:status")),__append('</th>\n          <th id="'),__append(idPrefix),__append('-dateProperty" class="is-min">'),__append(t("reports","orders:"+dateProperty)),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:cnf:date")),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:dlv:date")),__append('</th>\n          <th class="is-min">'),__append(t("reports","orders:planner")),__append("</th>\n          <th>"),__append(t("orders","PROPERTY:delayReason")),__append("</th>\n          <th>"),__append(t("reports","orders:comment")),__append('</th>\n        </tr>\n      </thead>\n      <tbody id="'),__append(idPrefix),__append('-empty" class="'),__append(orders.length?"hidden":""),__append('">\n        <tr>\n          <td colspan="12">'),__append(t("reports","orders:empty")),__append('</td>\n        </tr>\n      </tbody>\n      <tbody id="'),__append(idPrefix),__append('-orders" class="'),__append(orders.length?"":"hidden"),__append('">\n        '),orders.forEach(function(e){__append("\n        "),__append(renderOrderRow({canViewOrders,order:e})),__append("\n        ")}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="pagination-container"></div>\n</div>\n');return __output.join("")}});