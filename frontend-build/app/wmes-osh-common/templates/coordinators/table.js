define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<table class="table table-bordered table-condensed" style="background-color: #FFF">\n  <thead>\n  <tr>\n    <th class="is-min">'),__append(t("wmes-osh-common","coordinators:types")),__append("</th>\n    "),kinds&&(__append('\n      <th class="is-min">'),__append(t("wmes-osh-common","coordinators:kinds")),__append("</th>\n    ")),__append("\n    <th>"),__append(t("wmes-osh-common","coordinators:users")),__append("</th>\n  </tr>\n  </thead>\n  <tbody>\n    "),coordinators.forEach(n=>{__append('\n      <tr>\n        <td class="is-min">'),__append(n.types.join("; ")),__append("</td>\n        "),kinds&&(__append('\n          <td class="is-min">'),__append(n.kinds.join("; ")),__append("</td>\n        ")),__append("\n        <td>"),__append(n.users.join("; ")),__append("</td>\n      </tr>\n    ")}),__append("\n  </tbody>\n</table>\n");return __output}});