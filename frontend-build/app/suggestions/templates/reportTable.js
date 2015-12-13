define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed">\n  <tbody>\n    '),rows.forEach(function(n){__append('\n    <tr data-id="'),__append(n.id),__append('">\n      <td '),n.color&&(__append('style="border-left-color: '),__append(n.color),__append('"')),__append(">"),__append(escape(n.label||t("suggestions","report:series:"+n.id))),__append('</td>\n      <td class="is-min is-number">'),__append(Math.round(n.abs||0).toLocaleString()),__append('</td>\n      <td class="is-min is-number">'),__append(Math.round(100*(n.rel||0)).toLocaleString()),__append("%</td>\n    </tr>\n    ")}),__append('\n    <tr>\n      <td colspan="3"></td>\n    </tr>\n  </tbody>\n</table>\n');return __output.join("")}});