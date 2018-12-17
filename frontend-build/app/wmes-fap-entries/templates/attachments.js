define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="fap-attachments fap-details-panel">\n  <div class="fap-details-panel-hd">'),__append(helpers.t("PROPERTY:attachments")),__append('</div>\n  <div class="fap-details-panel-bd fap-details-list">\n    '),model.attachments.forEach(function(a){__append('\n    <div class="fap-attachment fap-details-list-item" data-attachment-id="'),__append(a._id),__append('" data-preview="'),__append(a.preview?"1":"0"),__append('">\n      <i class="fa '),__append(a.icon),__append(' fap-details-list-icon"></i>\n      <a class="fap-details-list-label" href="/fap/entries/'),__append(model._id),__append("/attachments/"),__append(a._id),__append('" target="_blank">'),__append(escapeFn(a.label)),__append('</a>\n      <button class="fap-details-list-action" type="button"><i class="fa fa-wrench"></i></button>\n    </div>\n    ')}),__append('\n    <div style="border-top: 1px solid #ddd">&nbsp;</div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-preview" class="fap-attachment-preview hidden">\n    <span class="fap-attachment-preview-label"></span>\n    <img class="fap-attachment-preview-image">\n  </div>\n</div>\n');return __output.join("")}});