define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="wh-delivery-page">\n  <div id="'),__append(idPrefix),__append('-completed" class="wh-delivery-section-container" data-status="completed"></div>\n  <div id="'),__append(idPrefix),__append('-pending" class="wh-delivery-section-container" data-status="pending"></div>\n  <div id="'),__append(idPrefix),__append('-delivering" class="wh-delivery-section-container" data-status="delivering"></div>\n  <div id="'),__append(idPrefix),__append('-messageOverlay" class="wh-message-overlay"></div>\n  <div id="'),__append(idPrefix),__append('-message" class="wh-message message message-inline"></div>\n</div>\n');return __output}});