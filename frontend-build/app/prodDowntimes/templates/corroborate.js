define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-corroborate" class="prodDowntimes-corroborate" method="post">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("prodDowntimes","corroborate:comment")),__append('</label>\n    <textarea id="'),__append(idPrefix),__append('-comment" class="form-control prodDowntimes-corroborate-comment" name="comment" rows="3"></textarea>\n  </div>\n  <button type="submit" class="btn btn-primary"></button>\n</form>\n');return __output.join("")}});