define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="kanban-popover-container-image">\n  '),container.image&&(__append('\n  <img src="/kanban/containers/'),__append(container._id),__append('.jpg">\n  ')),__append('\n</div>\n<div class="kanban-popover-container-size">\n  '),__append(container.length),__append("mm x "),__append(container.width),__append("mm x "),__append(container.height),__append("mm\n</div>\n");return __output.join("")}});