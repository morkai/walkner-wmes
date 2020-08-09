define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form planning-mrp-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-date" class="control-label">'),__append(t("filter:date")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-date" name="date" class="form-control" type="date" value="'),__append(date),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-whStatuses" class="control-label">'),__append(t("filter:whStatuses")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-whStatuses" name="whStatuses" multiple class="form-control is-expandable" size="1" data-expanded-length="5">\n      '),["pending","started","finished","problem","cancelled"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('" '),__append(_.includes(whStatuses,e)?"selected":""),__append(">"),__append(t("status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-psStatuses" class="control-label">'),__append(t("filter:psStatuses")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-psStatuses" name="psStatuses" multiple class="form-control is-expandable" size="1" data-expanded-length="7">\n      '),["unknown","new","started","partial","finished","aside","cancelled"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('" '),__append(_.includes(psStatuses,e)?"selected":""),__append(">"),__append(t("planning","orders:psStatus:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-distStatuses" class="control-label">'),__append(t("filter:distStatuses")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-distStatuses" name="distStatuses" multiple class="form-control is-expandable" size="1" data-expanded-length="7">\n      '),["pending","started","finished"].forEach(function(e){__append('\n        <option value="'),__append(e),__append('" '),__append(_.includes(distStatuses,e)?"selected":""),__append(">"),__append(t("distStatus:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <div class="dateTimeRange">\n      <div class="dateTimeRange-labels">\n        <div class="dateTimeRange-label">\n          <label for="'),__append(idPrefix),__append('-from" class="control-label">'),__append(t("filter:startTime")),__append('</label>\n        </div>\n      </div>\n      <div class="dateTimeRange-fields">\n        <div class="dateTimeRange-field dateTimeRange-from">\n          <input id="'),__append(idPrefix),__append('-from" name="from" class="form-control" type="time" step="60" value="'),__append(from),__append('">\n        </div>\n        <div class="dateTimeRange-separator">-</div>\n        <div class="dateTimeRange-field dateTimeRange-to">\n          <input id="'),__append(idPrefix),__append('-to" name="to" class="form-control" type="time" step="60" value="'),__append(to),__append('">\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button id="'),__append(idPrefix),__append('-useDarkerTheme" type="button" class="btn btn-default '),__append(useDarkerTheme?"active":""),__append('">\n        <i class="fa fa-adjust"></i>\n        <span>'),__append(t("filter:useDarkerTheme")),__append("</span>\n      </button>\n    </div>\n  </div>\n</form>\n");return __output}});