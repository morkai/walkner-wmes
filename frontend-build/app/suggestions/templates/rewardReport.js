define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<div>\r\n  "),users.length?(__append('\r\n  <table class="table table-bordered table-striped table-hover">\r\n    <thead>\r\n    <tr>\r\n      <th class="is-min" rowspan="2">'),__append(t("reward:name")),__append('</th>\r\n      <th class="is-min" colspan="2">'),__append(t("reward:finished")),__append('</th>\r\n      <th class="is-min" colspan="2">'),__append(t("reward:kom")),__append('</th>\r\n      <th class="is-min" colspan="2">'),__append(t("reward:total")),__append('</th>\r\n      <th rowspan="2">'),__append(t("reward:sections")),__append('</th>\r\n    </tr>\r\n    <tr>\r\n      <th class="is-min">'),__append(t("reward:count")),__append('</th>\r\n      <th class="is-min">'),__append(t("reward:part")),__append('</th>\r\n      <th class="is-min">'),__append(t("reward:count")),__append('</th>\r\n      <th class="is-min">'),__append(t("reward:part")),__append('</th>\r\n      <th class="is-min">'),__append(t("reward:count")),__append('</th>\r\n      <th class="is-min">'),__append(t("reward:part")),__append("</th>\r\n    </tr>\r\n    </thead>\r\n    <tbody>\r\n    "),users.forEach(function(n){__append('\r\n    <tr>\r\n      <td class="is-min">'),__append(escapeFn(n.name)),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.finished[0]?n.finished[0].toLocaleString():""),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.finished[1]?n.finished[1].toLocaleString():""),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.kom[0]?n.kom[0].toLocaleString():""),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.kom[1]?n.kom[1].toLocaleString():""),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.total[0].toLocaleString()),__append('</td>\r\n      <td class="is-min is-number">'),__append(n.total[1].toLocaleString()),__append("</td>\r\n      <td>"),__append(n.sections.join("; ")),__append("</td>\r\n    </tr>\r\n    ")}),__append("\r\n    </tbody>\r\n  </table>\r\n  ")):(__append('\r\n  <p class="well">'),__append(t("reward:empty")),__append("</p>\r\n  ")),__append("\r\n</div>\r\n");return __output}});