define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="page-actions-jump" title="',t(nlsDomain,"PAGE_ACTION:jump:title"),'">\n  <div class="input-group">\n    <input name="rid" type="text" class="form-control" placeholder="',t(nlsDomain,"PAGE_ACTION:jump:placeholder"),'" required autofocus pattern="^ *[0-9]+ *$">\n    <span class="input-group-btn">\n      <button class="btn btn-default" type="submit"><i class="fa fa-search"></i></button>\n    </span>\n  </div>\n</form>\n')}();return buf.join("")}});