define(["app/wmes-osh-common/pages/DetailsPage","../views/RootCausesView","../views/SolutionView","app/wmes-osh-actions/templates/details/page","app/wmes-osh-actions/templates/details/props"],function(e,s,t,i,o){"use strict";return e.extend({template:i,propsTemplate:o,defineViews:function(){e.prototype.defineViews.apply(this,arguments),this.rootCausesView=new s({model:this.model}),this.solutionView=new t({model:this.model}),this.setView("#-rootCauses",this.rootCausesView),this.setView("#-solution",this.solutionView)}})});