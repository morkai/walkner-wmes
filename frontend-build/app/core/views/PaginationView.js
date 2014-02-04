define(["underscore","../View","app/core/templates/pagination"],function(e,t,i){var a={pageNumbers:3,firstLastLinksVisible:!0,prevNextLinksVisible:!0,dotsVisible:!0},s=t.extend({template:i,events:{"click a":function(e){if(0===e.button){e.preventDefault();var t=e.currentTarget;this.changePage(+t.getAttribute("data-page"),t.getAttribute("href"))}}}});return s.prototype.initialize=function(){e.defaults(this.options,a),this.listenTo(this.model,"change:urlTemplate",this.render)},s.prototype.afterRender=function(){var e=this.model.get("limit");(-1===e||this.model.get("totalCount")<=e)&&this.$el.hide()},s.prototype.changePage=function(e,t){this.model.set({page:e}),t&&this.broker.publish("router.navigate",{url:t})},s.prototype.serialize=function(){var e=this.options,t=this.model,i=t.get("page"),a=Math.ceil(t.get("totalCount")/t.get("limit")),s=(e.pageNumbers-1)/2;e.dotsVisible&&(s+=1);var r=i,n=r+s,l=!0,g=!1;1>r-s?r=1:(r-=s,g=e.dotsVisible&&1!==r),g&&(r+=1),n>a&&(n=a,l=!1),s+1>i?(n+=s+1-i,n>a&&(n=a)):i>a-s&&(r-=s-(a-i),1>r&&(r=1));var o=e.dotsVisible&&l&&n!==a;return o&&(n-=1),1===r&&(g=!1),{pageCount:a,page:i,skip:t.get("skip"),limit:t.get("limit"),visible:a>1,firstLastLinksVisible:e.firstLastLinksVisible,prevNextLinksVisible:e.prevNextLinksVisible,leftDotsVisible:g,rightDotsVisible:o,firstPageLinkAvailable:i>1,lastPageLinkAvailable:a>i,prevPageLinkAvailable:i>1,nextPageLinkAvailable:a>i,firstPageHref:this.genPageHref(1),lastPageHref:this.genPageHref(a),prevPageHref:this.genPageHref(i-1),nextPageHref:this.genPageHref(i+1),pages:this.genPages(r,n)}},s.prototype.genPageHref=function(e){var t=this.model.get("urlTemplate"),i=this.model.get("limit");return t.replace("${page}",e).replace("${skip}",(e-1)*i).replace("${limit}",i)},s.prototype.genPages=function(e,t){for(var i=[],a=this.model.get("page"),s=e;t>=s;++s)i.push({no:s,active:s===a,href:this.genPageHref(s)});return i},s});