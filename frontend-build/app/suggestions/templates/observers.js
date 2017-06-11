define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed table-hover suggestions-details-observers">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(t("suggestions","PROPERTY:observers:name")),__append('</th>\n      <th class="is-min">'),__append(t("suggestions","PROPERTY:observers:role")),__append("</th>\n      <th>"),__append(t("suggestions","PROPERTY:observers:lastSeenAt")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.observers.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("suggestions","observers:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.observers.forEach(function(e){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(e.user.label)),__append('</td>\n      <td class="is-min">'),__append(escapeFn(t("suggestions","role:"+e.role))),__append("</td>\n      <td>"),__append(escapeFn(e.lastSeenAt?time.format(e.lastSeenAt,"LLLL"):"-")),__append("</td>\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});