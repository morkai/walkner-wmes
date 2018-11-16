define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed">\n  <tbody>\n    '),rows.forEach(function(n){__append('\n    <tr data-id="'),__append(n.id),__append('">\n      '),n.no&&(__append('\n      <td class="is-min is-number" style="border-left: 0">'),__append(n.no),__append(".</td>\n      ")),__append('\n      <td style="'),n.color?(__append("border-left-color: "),__append(n.color),__append(";")):__append("border-left: 0;"),__append('">'),__append(escapeFn(n.label||t("suggestions","report:series:"+n.id))),__append('</td>\n      <td class="is-min is-number">'),__append(Math.round(n.abs||0).toLocaleString()),__append('</td>\n      <td class="is-min is-number">'),__append(Math.round(100*(n.rel||0)).toLocaleString()),__append("%</td>\n    </tr>\n    ")}),__append('\n    <tr>\n      <td colspan="4" style="'),rows.length&&!rows[0].color&&__append("border-left: 0;"),__append('"></td>\n    </tr>\n  </tbody>\n</table>\n');return __output.join("")}});