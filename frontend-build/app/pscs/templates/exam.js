define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="pscs-exam" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escape(formMethod)),__append('">\n  <input id="'),__append(idPrefix),__append('-submit" type="submit">\n  <div id="'),__append(idPrefix),__append('-section-start" class="pscs-exam-section hidden" data-section="start">\n    <p>'),__append(t("pscs","exam:start:label")),__append('</p>\n    <div class="input-group">\n      <input id="'),__append(idPrefix),__append('-personnelId" class="form-control input-lg" type="text" name="personnelId" placeholder="'),__append(t("pscs","exam:start:placeholder")),__append('">\n      <span class="input-group-btn">\n        <button id="'),__append(idPrefix),__append('-start" type="button" class="btn btn-primary btn-lg">'),__append(t("pscs","exam:start:submit")),__append('</button>\n      </span>\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-section-success" class="pscs-exam-section hidden" data-section="success">\n    <div class="pscs-exam-inline">\n      <p><i class="fa fa-thumbs-up"></i></p>\n    </div>\n    <div class="pscs-exam-inline">\n      <p>'),__append(t("pscs","exam:success:p1")),__append("</p>\n      <p>"),__append(t("pscs","exam:success:p2")),__append('</p>\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-section-failure" class="pscs-exam-section hidden" data-section="failure">\n    <div class="pscs-exam-inline">\n      <p><i class="fa fa-thumbs-down"></i></p>\n    </div>\n    <div class="pscs-exam-inline">\n      <p>'),__append(t("pscs","exam:failure:label")),__append('</p>\n      <p id="'),__append(idPrefix),__append('-validAnswers"></p>\n      <ul>\n        <li><a href="#pscs/learn">'),__append(t("pscs","exam:failure:learn")),__append('</a></li>\n        <li><a href="#pscs/exam" data-action="cancel">'),__append(t("pscs","exam:failure:test")),__append("</a></li>\n      </ul>\n    </div>\n  </div>\n  "),[2,3,4,2,3,4,3,3].forEach(function(n,p){__append("\n  ");var a=p+1;__append('\n  <div id="'),__append(idPrefix),__append("-section-"),__append(a),__append('" class="pscs-exam-section hidden" data-section="'),__append(a),__append('">\n    <div class="pscs-qna">\n      <p class="pscs-question">'),__append(t("pscs","exam:"+a+":question")),__append("</p>\n      ");for(var e=1;e<=n;++e)__append('\n      <div class="radio pscs-answer">\n        <label>\n          <input type="radio" name="answers['),__append(a),__append(']" value="'),__append(e),__append('">\n          '),__append(t("pscs","exam:"+a+":"+e)),__append("\n        </label>\n      </div>\n      ");__append("\n    </div>\n    "),8===a?(__append('\n    <button type="button" class="btn btn-primary btn-lg" data-action="finish">'),__append(t("pscs","exam:finish")),__append("</button>\n    ")):(__append('\n    <button type="button" class="btn btn-default btn-lg" data-action="next">'),__append(t("pscs","exam:next")),__append("</button>\n    ")),__append("\n    "),a>1&&(__append('\n    <button type="button" class="btn btn-link btn-lg" data-action="prev">'),__append(t("pscs","exam:prev")),__append("</button>\n    ")),__append('\n    <button type="button" class="btn btn-link btn-lg" data-action="cancel">'),__append(t("pscs","exam:cancel")),__append("</button>\n  </div>\n  ")}),__append("\n</form>\n");return __output.join("")}});