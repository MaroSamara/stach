/* Stach site: smooth scrolling, scroll-linked motion and the card picker */
(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- smooth scrolling (Lenis), with plain scrolling as fallback ---------- */
  var lenis = null;
  if(!reduce && window.Lenis){
    lenis = new window.Lenis({ lerp:0.09, smoothWheel:true, wheelMultiplier:1 });
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var id = a.getAttribute("href");
        var el = id.length > 1 ? document.querySelector(id) : document.body;
        if(!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset:-70, duration:1.3 });
      });
    });
  }

  /* ---------- scroll-linked effects ---------- */
  var heroText = document.querySelector(".hero .reveal");
  var p1 = document.querySelector(".hero-phones .p1"), p2 = document.querySelector(".hero-phones .p2");
  var rise = Array.prototype.slice.call(document.querySelectorAll(".shots .phone, .trio .phone"));
  rise.forEach(function(el){ el.setAttribute("data-rise", ""); });
  var dark = document.querySelector(".dark");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".story-steps .step"));
  var screens = Array.prototype.slice.call(document.querySelectorAll(".story-phone .screens img"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".story-dots i"));
  var storyPhone = document.querySelector(".story-phone");
  var current = -1;

  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function frame(){
    var vh = window.innerHeight, y = window.scrollY;
    if(!reduce){
      // hero: headline drifts up and fades, phones fan out and settle
      var h = clamp(y / (vh * 0.8));
      if(heroText){
        if(h > 0){ heroText.style.transform = "translateY(" + (-h * 60) + "px)"; heroText.style.opacity = String(1 - h * 0.9); }
        else { heroText.style.transform = ""; heroText.style.opacity = ""; }
      }
      if(p1) p1.style.transform = "translate(" + (-h * 50) + "px," + (h * 40) + "px) rotate(" + (-6 - h * 6) + "deg)";
      if(p2) p2.style.transform = "translate(" + (h * 50) + "px," + (-h * 30) + "px) rotate(" + (5 + h * 6) + "deg)";
      // phones rise and un-tilt as they come into view
      rise.forEach(function(el){
        var r = el.getBoundingClientRect();
        el.style.setProperty("--p", clamp((vh - r.top) / (vh * 0.55)).toFixed(3));
      });
      // dark Split section opens like a sheet
      if(dark){
        var dr = dark.getBoundingClientRect();
        dark.style.setProperty("--open", clamp((vh - dr.top) / (vh * 0.7)).toFixed(3));
      }
    }
    // story: whichever step is nearest the middle of the screen wins
    if(steps.length){
      var best = 0, bestD = Infinity;
      steps.forEach(function(st, i){
        var r = st.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh / 2);
        if(d < bestD){ bestD = d; best = i; }
      });
      if(best !== current){
        current = best;
        steps.forEach(function(st, i){ st.classList.toggle("active", i === best); });
        screens.forEach(function(im, i){ im.classList.toggle("on", i === best); });
        dots.forEach(function(d, i){ d.classList.toggle("on", i === best); });
        if(storyPhone && !reduce){ storyPhone.style.transform = "rotate(" + (best % 2 ? 2.5 : -2.5) + "deg)"; }
      }
    }
  }
  var ticking = false;
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; frame(); }); } }
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", onScroll);
  frame();

  /* ---------- card picker ---------- */
  var CARDS = [
    { id:"graphite", name:"Black Metal", de:"Black Metal", sub:"Brushed black steel", subDe:"Gebürsteter schwarzer Stahl", c:["#3A3A3D","#161618","#0B0B0C"], tex:"brushed", dark:true,  acc:["#2C2C2E","#8E8E93"] },
    { id:"roseGold", name:"Rose Gold",   de:"Roségold",    sub:"Brushed rose gold",   subDe:"Gebürstetes Roségold",        c:["#F8D9CC","#DDA58F","#B07563"], tex:"brushed", dark:false, acc:["#A96D5B","#D59F8C"] },
    { id:"pearl",    name:"Pearl",       de:"Perle",       sub:"Pearl white",          subDe:"Perlweiß",                    c:["#FFFFFF","#F1EEE7","#E2DDD2"], tex:"pearl",   dark:false, acc:["#7D7262","#D6CCBA"] },
    { id:"sapphire", name:"Sapphire",    de:"Saphir",      sub:"Sapphire blue metal",  subDe:"Saphirblaues Metall",         c:["#3C5A99","#1C2F5E","#0D1733"], tex:"brushed", dark:true,  acc:["#2F5AA8","#6E95E0"] },
    { id:"emerald",  name:"Emerald",     de:"Smaragd",     sub:"Emerald green metal",  subDe:"Smaragdgrünes Metall",        c:["#3E8E6A","#1E5A41","#0E3324"], tex:"brushed", dark:true,  acc:["#1F7A55","#4DB88A"] },
    { id:"gold",     name:"Gold",        de:"Gold",        sub:"Brushed gold",         subDe:"Gebürstetes Gold",            c:["#F7E7B4","#D4B46A","#9C7A34"], tex:"brushed", dark:false, acc:["#9C7B34","#D2B46E"] },
    { id:"carbon",   name:"Carbon",      de:"Carbon",      sub:"Carbon fibre",         subDe:"Carbonfaser",                 c:["#2A2A2C","#1A1A1C","#101012"], tex:"carbon",  dark:true,  acc:["#3A3A3C","#9A9AA0"] },
    { id:"holo",     name:"Holographic", de:"Holografisch",sub:"Shifts with the light",subDe:"Schimmert im Licht",          c:["#E9ECF2","#C9CFDA","#AEB6C4"], tex:"holo",    dark:false, acc:["#7466D8","#A99BFF"] }
  ];
  var MARK = '<svg viewBox="0 0 100 100"><path d="M46 46 L46 86 A40 40 0 1 1 86 46 Z" fill="currentColor"/><path d="M52 52 L92 52 A40 40 0 0 1 52 92 Z" fill="#D9C58F"/></svg>';
  var NFC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.5 7.5a6 6 0 0 1 0 9M12 5a9.5 9.5 0 0 1 0 14M15.5 2.5a13 13 0 0 1 0 19"/></svg>';
  var deck = document.getElementById("deck");
  if(!deck) return;
  var isDe = function(){ return (window.lang || document.documentElement.lang) === "de"; };
  var els = CARDS.map(function(c, i){
    var b = document.createElement("button");
    b.type = "button"; b.className = "mcard " + c.tex;
    b.style.setProperty("--c0", c.c[0]); b.style.setProperty("--c1", c.c[1]); b.style.setProperty("--c2", c.c[2]);
    b.style.setProperty("--ink-on", c.dark ? "#F5F5F7" : "#1C1C1E");
    b.innerHTML = '<div class="face"><div class="tex"></div><div class="emblem">' + MARK + '</div><div class="brand">' + MARK + 'STACH</div><div class="tier"></div><div class="chip"></div><div class="nfc">' + NFC + '</div><div class="since">MEMBER<br>SINCE<b>26</b></div><div class="holder">YOUR NAME</div><div class="shine"></div><div class="sweep"></div></div>';
    b.addEventListener("click", function(){ if(i !== active){ go(i); } else { use(); } });
    deck.appendChild(b);
    return b;
  });
  var saved = null; try { saved = localStorage.getItem("stachCard"); } catch(e){}
  var applied = Math.max(0, CARDS.findIndex(function(c){ return c.id === (saved || "roseGold"); }));
  var active = applied;

  function label(){
    var c = CARDS[active], de = isDe();
    document.getElementById("deck-title").textContent = de ? c.de : c.name;
    document.getElementById("deck-sub").textContent = de ? c.subDe : c.sub;
    var useBtn = document.getElementById("deck-use");
    var nm = de ? c.de : c.name;
    useBtn.textContent = active === applied ? (de ? "Ausgewählt: " + nm : "Using " + nm) : (de ? nm + " verwenden" : "Use " + nm);
    useBtn.disabled = active === applied;
    useBtn.style.opacity = active === applied ? .55 : 1;
    els.forEach(function(el, i){ el.querySelector(".tier").textContent = (de ? CARDS[i].de : CARDS[i].name) + (de ? " Karte" : " card"); el.setAttribute("aria-label", (de ? CARDS[i].de : CARDS[i].name)); });
  }
  function layout(){
    var narrow = window.innerWidth < 600, gap = narrow ? 118 : 178;
    els.forEach(function(el, i){
      var off = i - active, a = Math.abs(off);
      el.style.zIndex = String(100 - a);
      el.style.opacity = a > 3 ? "0" : String(1 - a * 0.12);
      el.style.pointerEvents = a > 3 ? "none" : "auto";
      el.style.filter = a ? "saturate(.85) brightness(" + (1 - a * 0.06) + ")" : "none";
      el.style.transform = "translateX(" + (off * gap) + "px) translateZ(" + (-a * 120) + "px) rotateY(" + (off * -22) + "deg) scale(" + (a ? 0.9 - a * 0.03 : 1) + ")";
      el.tabIndex = a ? -1 : 0;
    });
    label();
  }
  function go(i){ active = (i + CARDS.length) % CARDS.length; layout(); }
  function setAccent(c, animate){
    root.style.setProperty("--accent", c.acc[0]);
    root.style.setProperty("--accent-2", c.acc[1]);
    var meta = document.querySelector('meta[name="theme-color"]'); if(meta && animate){ /* keep page background */ }
  }
  var toastT = null;
  function use(){
    applied = active;
    var c = CARDS[active], el = els[active];
    try { localStorage.setItem("stachCard", c.id); } catch(e){}
    el.classList.remove("lift", "swept"); void el.offsetWidth; el.classList.add("lift", "swept");
    setAccent(c, true);
    var t = document.getElementById("deck-toast");
    var nm = isDe() ? c.de : c.name;
    t.innerHTML = "<i></i>" + (isDe() ? "Stach trägt jetzt " + nm : "Stach now wears " + nm);
    t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove("show"); }, 2200);
    label();
  }
  document.getElementById("deck-prev").addEventListener("click", function(){ go(active - 1); });
  document.getElementById("deck-next").addEventListener("click", function(){ go(active + 1); });
  document.getElementById("deck-use").addEventListener("click", use);
  deck.addEventListener("keydown", function(e){
    if(e.key === "ArrowLeft"){ e.preventDefault(); go(active - 1); }
    if(e.key === "ArrowRight"){ e.preventDefault(); go(active + 1); }
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); use(); }
  });
  // swipe / drag between cards
  var sx = null, moved = false;
  deck.addEventListener("pointerdown", function(e){ sx = e.clientX; moved = false; });
  window.addEventListener("pointerup", function(e){
    if(sx === null) return;
    var dx = e.clientX - sx; sx = null;
    if(Math.abs(dx) > 40){ moved = true; go(active + (dx < 0 ? 1 : -1)); }
  });
  deck.addEventListener("click", function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  // the front card tilts towards the pointer, with a moving shine
  deck.addEventListener("pointermove", function(e){
    if(reduce) return;
    var face = els[active].querySelector(".face"), r = face.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    if(px < -0.3 || px > 1.3 || py < -0.3 || py > 1.3) return;
    face.style.setProperty("--ry", ((px - 0.5) * 18).toFixed(2) + "deg");
    face.style.setProperty("--rx", ((0.5 - py) * 14).toFixed(2) + "deg");
    face.style.setProperty("--sx", (px * 100).toFixed(1) + "%");
    face.style.setProperty("--sy", (py * 100).toFixed(1) + "%");
  });
  deck.addEventListener("pointerleave", function(){
    var face = els[active].querySelector(".face");
    face.style.setProperty("--ry", "0deg"); face.style.setProperty("--rx", "0deg");
  });
  document.querySelectorAll(".lang button").forEach(function(b){ b.addEventListener("click", function(){ setTimeout(label, 0); }); });
  window.addEventListener("resize", layout);
  setAccent(CARDS[applied], false);
  layout();
})();
