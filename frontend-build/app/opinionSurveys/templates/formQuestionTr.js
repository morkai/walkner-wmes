define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td class="is-min">\n    <input type="hidden" name="questions['),__append(i),__append(']._id" value="'),__append(question._id),__append('">\n    '),__append(escapeFn(question._id)),__append('\n  </td>\n  <td><input class="form-control" name="questions['),__append(i),__append('].short" type="text" autocomplete="new-password" value="'),__append(escapeFn(question.short)),__append('" required></td>\n  <td><input class="form-control" name="questions['),__append(i),__append('].full" type="text" autocomplete="new-password" value="'),__append(escapeFn(question.full)),__append('" required></td>\n  <td class="actions">\n    <div class="actions-group">\n      <button class="btn btn-default opinionSurveys-form-moveRowUp" type="button"><i class="fa fa-arrow-up"></i></button>\n      <button class="btn btn-default opinionSurveys-form-moveRowDown" type="button"><i class="fa fa-arrow-down"></i></button>\n      <button class="btn btn-default opinionSurveys-form-deleteRow" type="button"><i class="fa fa-remove"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output.join("")}});