define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-condensed '),__append(bordered?"table-bordered table-hover":""),__append('">\n  <thead>\n  <tr>\n    <th class="is-min">'),__append(t("qiResults","correctiveActions:#")),__append('</th>\n    <th class="is-min">'),__append(t("qiResults","correctiveActions:status")),__append('</th>\n    <th class="is-min">'),__append(t("qiResults","correctiveActions:when")),__append("</th>\n    <th>"),__append(t("qiResults","correctiveActions:who")),__append("</th>\n    <th>"),__append(t("qiResults","correctiveActions:what")),__append("</th>\n  </tr>\n  </thead>\n  <tbody>\n  "),correctiveActions.forEach(function(e,n){__append('\n  <tr>\n    <td class="is-min">'),__append(n+1),__append('</td>\n    <td class="is-min">'),__append(escape(e.status)),__append('</td>\n    <td class="is-min">'),__append(escape(e.when)),__append("</td>\n    <td>"),__append(escape(e.who)),__append('</td>\n    <td class="text-lines">'),__append(escape(e.what)),__append("</td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});