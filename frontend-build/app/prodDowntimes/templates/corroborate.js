define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form id="'),__output.push(idPrefix),__output.push('-corroborate" class="prodDowntimes-corroborate" method="post">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-comment" class="control-label">'),__output.push(t("prodDowntimes","corroborate:comment")),__output.push('</label>\n    <textarea id="'),__output.push(idPrefix),__output.push('-comment" class="form-control prodDowntimes-corroborate-comment" name="comment" rows="3"></textarea>\n  </div>\n  <button type="submit" class="btn btn-primary"></button>\n</form>\n');return __output.join("")}});