define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="kanban-filter kanban-filter-text">\n  <input type="text" autocomplete="new-password" class="form-control" tabindex="100000" autofocus>\n  '),function(){__append('<div class="kanban-filter-buttons">\n  <i class="fa fa-question-circle-o kanban-filter-help"></i>\n  <button class="btn btn-primary" tabindex="100000" data-action="submit" title="'),__append(t("kanban","filters:submit")),__append('"><i class="fa fa-filter"></i></button>\n  <button class="btn btn-default" type="button" tabindex="100000" data-action="clear" title="'),__append(t("kanban","filters:clear")),__append('"><i class="fa fa-times"></i></button>\n</div>\n')}.call(this),__append("\n</form>\n");return __output.join("")}});