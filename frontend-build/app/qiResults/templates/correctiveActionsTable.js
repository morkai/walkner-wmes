define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-condensed '),__append(bordered?"table-bordered table-hover":""),__append('">\n  <thead>\n  <tr>\n    <th class="is-min">'),__append(helpers.t("correctiveActions:#")),__append('</th>\n    <th class="is-min">'),__append(helpers.t("correctiveActions:status")),__append('</th>\n    <th class="is-min">'),__append(helpers.t("correctiveActions:when")),__append("</th>\n    <th>"),__append(helpers.t("correctiveActions:who")),__append("</th>\n    <th>"),__append(helpers.t("correctiveActions:what")),__append("</th>\n  </tr>\n  </thead>\n  <tbody>\n  "),correctiveActions.forEach(function(e,n){__append('\n  <tr>\n    <td class="is-min">'),__append(n+1),__append('</td>\n    <td class="is-min">'),__append(escapeFn(e.status)),__append('</td>\n    <td class="is-min">'),__append(escapeFn(e.when)),__append('</td>\n    <td class="is-min qiResults-correctiveActions-who">'),__append(escapeFn(e.who)),__append('</td>\n    <td class="text-lines">'),__append(escapeFn(e.what)),__append("</td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});