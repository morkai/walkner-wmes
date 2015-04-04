define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="well filter-form">\n  <div class="form-group">\n    <div id="'),__output.push(idPrefix),__output.push('-statuses" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default" title="'),__output.push(t("factoryLayout","statuses:online:title")),__output.push('">\n        <input type="checkbox" name="statuses[]" value="online"> <i class="fa fa-plug"></i><span>'),__output.push(t("factoryLayout","statuses:online")),__output.push('</span>\n      </label>\n      <label class="btn btn-default" title="'),__output.push(t("factoryLayout","statuses:offline:title")),__output.push('">\n        <input type="checkbox" name="statuses[]" value="offline"> <i class="fa fa-power-off"></i><span>'),__output.push(t("factoryLayout","statuses:offline")),__output.push('</span>\n      </label>\n    </div>\n  </div>\n  <div class="form-group">\n    <div id="'),__output.push(idPrefix),__output.push('-states" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default factoryLayout-displayOptions-idle">\n        <input type="checkbox" name="states[]" value="idle">\n        <i class="fa fa-cloud"></i><span>'),__output.push(t("factoryLayout","states:idle")),__output.push('</span>\n      </label>\n      <label class="btn btn-default factoryLayout-displayOptions-working">\n        <input type="checkbox" name="states[]" value="working">\n        <i class="fa fa-cog"></i><span>'),__output.push(t("factoryLayout","states:working")),__output.push('</span>\n      </label>\n      <label class="btn btn-default factoryLayout-displayOptions-downtime">\n        <input type="checkbox" name="states[]" value="downtime">\n        <i class="fa fa-bell"></i><span>'),__output.push(t("factoryLayout","states:downtime")),__output.push('</span>\n      </label>\n    </div>\n  </div>\n  <div class="form-group">\n    <div id="'),__output.push(idPrefix),__output.push('-blacklisted" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="checkbox" name="blacklisted" value="1">\n        <i class="fa fa-ban"></i><span>'),__output.push(t("factoryLayout","options:blacklisted")),__output.push('</span>\n      </label>\n    </div>\n  </div>\n  <div class="form-group">\n    <button id="'),__output.push(idPrefix),__output.push('-showPicker" type="button" class="btn btn-default"><i class="fa fa-list-ol"></i><span>'),__output.push(t("factoryLayout","options:picker")),__output.push('</span></button>\n  </div>\n  <div class="form-group">\n    <button id="'),__output.push(idPrefix),__output.push('-save" type="button" class="btn btn-primary"><i class="fa fa-save"></i><span>'),__output.push(t("factoryLayout","options:save")),__output.push('</span></button>\n  </div>\n  <hr>\n  <div class="form-group factoryLayout-displayOptions-history">\n    <label><input id="'),__output.push(idPrefix),__output.push('-from" class="form-control" type="date" name="from" required placeholder="YYYY-MM-DD"></label>\n    <label>- <input id="'),__output.push(idPrefix),__output.push('-to" class="form-control" type="date" name="to" required placeholder="YYYY-MM-DD"></label>\n    <div id="'),__output.push(idPrefix),__output.push('-shifts" class="btn-group filter-btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="checkbox" name="shifts[]" value="1"> '),__output.push(t("core","SHIFT:1")),__output.push('\n      </label>\n      <label class="btn btn-default factoryLayout-displayOptions-working">\n        <input type="checkbox" name="shifts[]" value="2"> '),__output.push(t("core","SHIFT:2")),__output.push('\n      </label>\n      <label class="btn btn-default factoryLayout-displayOptions-downtime">\n        <input type="checkbox" name="shifts[]" value="3"> '),__output.push(t("core","SHIFT:3")),__output.push('\n      </label>\n    </div>\n    <div class="btn-group">\n      <button id="'),__output.push(idPrefix),__output.push('-loadHistory" type="submit" class="btn btn-primary"><i class="fa fa-calendar"></i><span>'),__output.push(t("factoryLayout","options:loadHistory")),__output.push('</span></button>\n      <button id="'),__output.push(idPrefix),__output.push('-resetHistory" type="button" class="btn btn-danger" title="'),__output.push(t("factoryLayout","options:resetHistory")),__output.push('"><i class="fa fa-times"></i></button>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});