define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="fap-attachment fap-details-list-item" data-attachment-id="'),__append(attachment._id),__append('" data-preview="'),__append(attachment.preview?"1":"0"),__append('">\n  <span class="fap-details-list-icon">\n    <i class="fa '),__append(uploaded?attachment.icon:"fa-spinner fa-spin"),__append('"></i>\n  </span>\n  '),uploaded?(__append('\n  <a class="fap-details-list-label" href="/fap/entries/'),__append(entryId),__append("/attachments/"),__append(attachment._id),__append('" target="_blank">'),__append(escapeFn(attachment.label)),__append("</a>\n  ")):(__append('\n  <span class="fap-details-list-label">'),__append(escapeFn(attachment.label)),__append("</span>\n  ")),__append('\n  <button class="fap-details-list-action" type="button" data-action="'),__append(uploaded?"showMenu":"removeUpload"),__append('" '),__append(uploaded&&!attachment.menu?"disabled":""),__append('><i class="fa '),__append(uploaded?"fa-wrench":"fa-times"),__append('"></i></button>\n</div>');return __output.join("")}});