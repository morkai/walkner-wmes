define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="paintShop-orderChanges-change">\n  '),__append(t("paintShop","orderChanges:change",{type:change.type,user:change.user,timeLong:change.time.long,timeShort:time.format(change.time.iso,"L LT")})),__append("\n  "),change.comment&&(__append('\n  <p class="text-lines">'),__append(escapeFn(change.comment)),__append("</p>\n  ")),__append("\n</div>\n");return __output.join("")}});