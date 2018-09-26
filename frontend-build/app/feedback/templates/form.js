define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="feedback-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-summary" class="control-label">'),__append(t("feedback","property:summary")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-summary" class="form-control" type="text" autocomplete="new-password" name="summary" required>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("feedback","property:comment")),__append('</label>\n    <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="10" placeholder="'),__append(t("feedback","form:placeholder:comment")),__append('" required></textarea>\n  </div>\n  <div class="form-group">\n    <div class="checkbox">\n      <label><input type="checkbox" name="watch" value="true"> '),__append(t("feedback","form:label:watch")),__append('</label>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("feedback","form:submit")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});