define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="trw-base-message '),__append(className),__append('" style="'),__append(outerStyle),__append('" data-id="'),__append(id),__append('">\n  <div class="trw-base-message-inner" style="'),__append(innerStyle),__append('">\n    <div class="trw-base-message-text">'),__append(text),__append("</div>\n  </div>\n  "),editable&&__append('\n  <div class="trw-base-message-resize"></div>\n  '),__append("\n</div>\n");return __output}});