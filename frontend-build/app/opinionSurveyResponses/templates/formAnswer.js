define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="form-group">\n  <label for="'),__append(idPrefix),__append("-answers-"),__append(question._id),__append('" class="control-label">'),__append(escape(question.short)),__append('</label>\n  <p class="help-block">'),__append(escape(question.full)),__append('</p>\n  <input type="hidden" name="answers['),__append(index),__append('].question" value="'),__append(question._id),__append('">\n  '),["no","na","yes"].forEach(function(e){__append('\n  <label class="radio-inline">\n    <input type="radio" name="answers['),__append(index),__append('].answer" value="'),__append(e),__append('" '),__append(value===e?"checked":""),__append(" required> "),__append(t("opinionSurveyResponses","answer:"+e)),__append("\n  </label>\n  ")}),__append("\n</div>\n");return __output.join("")}});