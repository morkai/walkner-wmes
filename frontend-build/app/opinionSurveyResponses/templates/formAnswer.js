define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="form-group">\n  <label for="'),__output.push(idPrefix),__output.push("-answers-"),__output.push(question._id),__output.push('" class="control-label">'),__output.push(escape(question["short"])),__output.push('</label>\n  <p class="help-block">'),__output.push(escape(question.full)),__output.push('</p>\n  <input type="hidden" name="answers['),__output.push(index),__output.push('].question" value="'),__output.push(question._id),__output.push('">\n  '),["yes","no","na"].forEach(function(u){__output.push('\n  <label class="radio-inline">\n    <input type="radio" name="answers['),__output.push(index),__output.push('].answer" value="'),__output.push(u),__output.push('" '),__output.push(value===u?"checked":""),__output.push(" required> "),__output.push(t("opinionSurveyResponses","answer:"+u)),__output.push("\n  </label>\n  ")}),__output.push("\n</div>\n");return __output.join("")}});