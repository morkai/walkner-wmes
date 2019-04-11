define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="trw-testing">\n  <div class="trw-testing-hd">\n    <div class="trw-testing-hd-app">TRW</div>\n    <div class="trw-testing-hd-prop" data-prop="workstation">\n      <div class="trw-testing-hd-prop-name">Stanowisko</div>\n      <div class="trw-testing-hd-prop-value">?</div>\n    </div>\n    <div class="trw-testing-hd-prop" data-prop="order">\n      <div class="trw-testing-hd-prop-name">Zlecenie</div>\n      <div class="trw-testing-hd-prop-value">?</div>\n    </div>\n    <div class="trw-testing-hd-prop" data-prop="program">\n      <div class="trw-testing-hd-prop-name">Program</div>\n      <div class="trw-testing-hd-prop-value">?</div>\n    </div>\n    <div class="trw-testing-hd-action">\n      <i id="'),__append(idPrefix),__append('-menu" class="fa fa-wrench"></i>\n    </div>\n  </div>\n  <div class="trw-testing-ft">\n    <p id="'),__append(idPrefix),__append('-message" class="trw-testing-message">???</p>\n  </div>\n  <div id="'),__append(idPrefix),__append('-viewer" class="trw-testing-preview">\n    <ul id="'),__append(idPrefix),__append('-viewer-images" class="trw-testing-preview-images">\n      <li><img src="/app/wmes-trw-tests/assets/no-preview.png"></li>\n    </ul>\n  </div>\n  <iframe id="'),__append(idPrefix),__append('-preview" class="trw-testing-preview"></iframe>\n  <div id="'),__append(idPrefix),__append('-vkb"></div>\n</div>\n');return __output.join("")}});