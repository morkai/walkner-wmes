define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output="";function __append(t){void 0!==t&&null!==t&&(__output+=t)}with(locals||{})__append('<table class="table table-bordered table-condensed table-hover table-striped reports-rearm-table">\n  <thead>\n  <tr>\n    <th class="is-min">'),__append(t("rearm:column:orderNo")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:mrp")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:shift")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:startedAt")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:finishedAt")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:firstAt")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:lastAt")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:avgTaktTime")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:metric1")),__append('</th>\n    <th class="is-min">'),__append(t("rearm:column:metric2")),__append("</th>\n    <th></th>\n  </tr>\n  </thead>\n  <tbody>\n  "),orders.forEach(function(n,e){__append('\n  <tr class="'),__append(orders[e+1]&&n.shiftAt!==orders[e+1].shiftAt?"is-eos":""),__append('">\n    <td class="is-min">'),__append(n.orderNo),__append('</td>\n    <td class="is-min">'),__append(escapeFn(n.mrp)),__append('</td>\n    <td class="is-min">'),__append(t("core","SHIFT",{date:time.format(n.shiftAt,"L"),shift:n.shiftNo})),__append('</td>\n    <td class="is-min">'),__append(n.startedAt?time.format(n.startedAt,"HH:mm:ss"):""),__append('</td>\n    <td class="is-min">'),__append(n.finishedAt?time.format(n.finishedAt,"HH:mm:ss"):""),__append('</td>\n    <td class="is-min">'),__append(time.format(n.firstAt,"HH:mm:ss")),__append('</td>\n    <td class="is-min">'),__append(time.format(n.lastAt,"HH:mm:ss")),__append('</td>\n    <td class="is-min">'),__append(escapeFn(n.avgTaktTime?time.toString(n.avgTaktTime,!0,!1):"")),__append('</td>\n    <td class="is-min">'),__append(escapeFn(n.metric1?time.toString(n.metric1,!0,!1):"")),__append('</td>\n    <td class="is-min text-right">\n      '),null!==n.metric2&&(__append("\n      "),__append(n.metric2<0?"-":"+"),__append(time.toString(Math.abs(n.metric2),!0,!1)),__append("\n      ")),__append("\n    </td>\n    <td></td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output}});