define(["app/i18n","app/viewport"],function(e,t){return function(n,i,a,r){function o(){t.msg.loaded()}function s(n){var i=n.statusText;if("abort"===i)return t.msg.loaded();var o=n.responseJSON;o&&o.error&&(o.error.code?i=o.error.code:o.error.message&&(i=o.error.message)),t.msg.loadingFailed(e(r,a,{code:i}))}return r||(r=n.nlsDomain?n.nlsDomain:n.model.prototype.nlsDomain?n.model.prototype.nlsDomain:"core"),a||(a=n.model?"MSG:LOADING_FAILURE":"MSG:LOADING_SINGLE_FAILURE"),i.listenTo(n,"request",function(e,n,i){"read"===i.syncMethod&&(t.msg.loading(),n.done(o),n.fail(s))}),n}});