(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{14:function(e,t,c){"use strict";c.r(t),c.d(t,"preload",(function(){return s}));var j=c(0),O=c(5);function l(e,t,c){const j=e.slice();return j[2]=t[c],j}function b(e,t,c){const j=e.slice();return j[2]=t[c],j}function n(e){let t,c,O,l,b,n=e[2].title+"";return{c(){t=Object(j.v)("li"),c=Object(j.v)("a"),O=Object(j.Q)(n),b=Object(j.O)(),this.h()},l(e){t=Object(j.l)(e,"LI",{});var l=Object(j.j)(t);c=Object(j.l)(l,"A",{rel:!0,href:!0});var r=Object(j.j)(c);O=Object(j.n)(r,n),r.forEach(j.u),b=Object(j.m)(l),l.forEach(j.u),this.h()},h(){Object(j.f)(c,"rel","prefetch"),Object(j.f)(c,"href",l="place/"+e[2].slug)},m(e,l){Object(j.C)(e,t,l),Object(j.d)(t,c),Object(j.d)(c,O),Object(j.d)(t,b)},p(e,t){1&t&&n!==(n=e[2].title+"")&&Object(j.M)(O,n),1&t&&l!==(l="place/"+e[2].slug)&&Object(j.f)(c,"href",l)},d(e){e&&Object(j.u)(t)}}}function r(e){let t,c,O,l,b,n,r,o,s=e[2].hasOwnProperty("iso_3166_1"),u=e[2].name+"",f=e[2].name!==e[2].name_en?"/ "+e[2].name_en:"",h=s&&function(e){let t,c,O=e[2].iso_3166_1+"";return{c(){t=Object(j.v)("kbd"),c=Object(j.Q)(O)},l(e){t=Object(j.l)(e,"KBD",{});var l=Object(j.j)(t);c=Object(j.n)(l,O),l.forEach(j.u)},m(e,O){Object(j.C)(e,t,O),Object(j.d)(t,c)},p:j.F,d(e){e&&Object(j.u)(t)}}}(e);return{c(){t=Object(j.v)("li"),c=Object(j.v)("a"),h&&h.c(),O=Object(j.O)(),l=Object(j.Q)(u),b=Object(j.O)(),n=Object(j.Q)(f),o=Object(j.O)(),this.h()},l(e){t=Object(j.l)(e,"LI",{style:!0});var r=Object(j.j)(t);c=Object(j.l)(r,"A",{rel:!0,href:!0});var s=Object(j.j)(c);h&&h.l(s),O=Object(j.m)(s),l=Object(j.n)(s,u),b=Object(j.m)(s),n=Object(j.n)(s,f),s.forEach(j.u),o=Object(j.m)(r),r.forEach(j.u),this.h()},h(){Object(j.f)(c,"rel","prefetch"),Object(j.f)(c,"href",r="#4/"+JSON.parse(e[2].centroid)[1]+"/"+JSON.parse(e[2].centroid)[0]),Object(j.N)(t,"width","400px"),Object(j.N)(t,"display","inline-block")},m(e,r){Object(j.C)(e,t,r),Object(j.d)(t,c),h&&h.m(c,null),Object(j.d)(c,O),Object(j.d)(c,l),Object(j.d)(c,b),Object(j.d)(c,n),Object(j.d)(t,o)},p(e,t){s&&h.p(e,t)},d(e){e&&Object(j.u)(t),h&&h.d()}}}function o(e){let t,c,O,o,s,u,f,h,i,a,d,v=e[0],g=[];for(let t=0;t<v.length;t+=1)g[t]=n(b(e,v,t));let m=e[1],p=[];for(let t=0;t<m.length;t+=1)p[t]=r(l(e,m,t));return{c(){t=Object(j.O)(),c=Object(j.v)("div"),O=Object(j.v)("h2"),o=Object(j.Q)("Places"),s=Object(j.O)(),u=Object(j.v)("ul");for(let e=0;e<g.length;e+=1)g[e].c();f=Object(j.O)(),h=Object(j.v)("h2"),i=Object(j.Q)("Countries"),a=Object(j.O)(),d=Object(j.v)("ul");for(let e=0;e<p.length;e+=1)p[e].c();this.h()},l(e){Object(j.I)('[data-svelte="svelte-jux9wy"]',document.head).forEach(j.u),t=Object(j.m)(e),c=Object(j.l)(e,"DIV",{class:!0});var l=Object(j.j)(c);O=Object(j.l)(l,"H2",{});var b=Object(j.j)(O);o=Object(j.n)(b,"Places"),b.forEach(j.u),s=Object(j.m)(l),u=Object(j.l)(l,"UL",{class:!0});var n=Object(j.j)(u);for(let e=0;e<g.length;e+=1)g[e].l(n);n.forEach(j.u),f=Object(j.m)(l),h=Object(j.l)(l,"H2",{});var r=Object(j.j)(h);i=Object(j.n)(r,"Countries"),r.forEach(j.u),a=Object(j.m)(l),d=Object(j.l)(l,"UL",{class:!0});var v=Object(j.j)(d);for(let e=0;e<p.length;e+=1)p[e].l(v);v.forEach(j.u),l.forEach(j.u),this.h()},h(){document.title="Country index",Object(j.f)(u,"class","svelte-1frg2tf"),Object(j.f)(d,"class","svelte-1frg2tf"),Object(j.f)(c,"class","uk-padding")},m(e,l){Object(j.C)(e,t,l),Object(j.C)(e,c,l),Object(j.d)(c,O),Object(j.d)(O,o),Object(j.d)(c,s),Object(j.d)(c,u);for(let e=0;e<g.length;e+=1)g[e].m(u,null);Object(j.d)(c,f),Object(j.d)(c,h),Object(j.d)(h,i),Object(j.d)(c,a),Object(j.d)(c,d);for(let e=0;e<p.length;e+=1)p[e].m(d,null)},p(e,[t]){if(1&t){let c;for(v=e[0],c=0;c<v.length;c+=1){const j=b(e,v,c);g[c]?g[c].p(j,t):(g[c]=n(j),g[c].c(),g[c].m(u,null))}for(;c<g.length;c+=1)g[c].d(1);g.length=v.length}if(2&t){let c;for(m=e[1],c=0;c<m.length;c+=1){const j=l(e,m,c);p[c]?p[c].p(j,t):(p[c]=r(j),p[c].c(),p[c].m(d,null))}for(;c<p.length;c+=1)p[c].d(1);p.length=m.length}},i:j.F,o:j.F,d(e){e&&Object(j.u)(t),e&&Object(j.u)(c),Object(j.t)(g,e),Object(j.t)(p,e)}}}function s(){return this.fetch("place.json").then(e=>e.json()).then(e=>({countries:e}))}function u(e,t,c){let{countries:j}=t,l=O.filter(e=>!("all"!=e.worldview&&"US"!=e.worldview||"sovereign state"!=e.description&&"dependent territory"!=e.description));return console.log(l),e.$$set=e=>{"countries"in e&&c(0,j=e.countries)},[j,l]}class f extends j.a{constructor(e){var t;super(),document.getElementById("svelte-1frg2tf-style")||((t=Object(j.v)("style")).id="svelte-1frg2tf-style",t.textContent="ul.svelte-1frg2tf{margin:0 0 1em 0;line-height:1.5}",Object(j.d)(document.head,t)),Object(j.B)(this,e,u,o,j.K,{countries:0})}}t.default=f}}]);