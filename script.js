// script.js — v4
(function(){
  lucide.createIcons();
  const yr = document.getElementById("year");
  if(yr) yr.textContent = new Date().getFullYear();

  // ── Scroll progress ──
  const bar = document.getElementById("scrollProg");
  function updateBar(){
    if(!bar) return;
    const p = window.scrollY / (document.documentElement.scrollHeight - innerHeight);
    bar.style.transform = "scaleX("+Math.min(1,p)+")";
  }
  window.addEventListener("scroll", updateBar, {passive:true});
  updateBar();

  // ── Canvas: data-node network ──
  const canvas = document.getElementById("bgCanvas");
  if(canvas){
    const ctx = canvas.getContext("2d");
    let W, H, nodes = [], raf;
    const N = 55, MAXD = 140, SPEED = 0.28;

    function resize(){
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, {passive:true});

    function mkNode(){
      return{
        x: Math.random()*W, y: Math.random()*H,
        vx:(Math.random()-.5)*SPEED, vy:(Math.random()-.5)*SPEED,
        r: Math.random()*1.5+.6,
        o: Math.random()*.6+.3
      };
    }
    for(let i=0;i<N;i++) nodes.push(mkNode());

    function draw(){
      ctx.clearRect(0,0,W,H);
      // draw edges
      for(let i=0;i<N;i++){
        const a = nodes[i];
        for(let j=i+1;j<N;j++){
          const b = nodes[j];
          const dx=a.x-b.x, dy=a.y-b.y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<MAXD){
            const alpha = (1-d/MAXD)*0.18;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
            ctx.strokeStyle = `rgba(0,220,130,${alpha})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      // draw nodes
      for(const n of nodes){
        ctx.beginPath();
        ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(0,220,130,${n.o*.55})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(n.x,n.y,n.r*2.5,0,Math.PI*2);
        ctx.fillStyle = `rgba(59,142,255,${n.o*.08})`;
        ctx.fill();
      }
      // move
      for(const n of nodes){
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<-10||n.x>W+10||n.y<-10||n.y>H+10){
          Object.assign(n,mkNode());
          n.x = n.x<0?0:n.x>W?W:n.x;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
  }

  // ── Terminal typewriter ──
  const termBody = document.getElementById("termBody");
  if(termBody){
    const lines = [
      {type:"cmd",   text:"$ python pipeline.py --env production"},
      {type:"gap",   text:""},
      {type:"info",  text:"  Connecting to data sources..."},
      {type:"ok",    text:"  ✓  Sources connected"},
      {type:"info",  text:"  Validating schema integrity..."},
      {type:"ok",    text:"  ✓  Schema validated (0 errors)"},
      {type:"info",  text:"  Transforming records..."},
      {type:"ok",    text:"  ✓  2,400,000 rows processed"},
      {type:"info",  text:"  Loading to analytics layer..."},
      {type:"ok",    text:"  ✓  3 tables ready in 0.82s"},
      {type:"gap",   text:""},
      {type:"final", text:"  STATUS  →  READY"},
    ];
    const colors = {
      cmd:  "var(--g)",
      info: "rgba(140,165,210,.55)",
      ok:   "var(--g)",
      gap:  "transparent",
      final:"#fff",
    };
    let li = 0;
    function addLine(){
      if(li >= lines.length) return;
      const l = lines[li++];
      const div = document.createElement("div");
      div.style.cssText = `
        color:${colors[l.type]||"var(--t2)"};
        font-size:${l.type==="final"?"13px":"11.5px"};
        font-weight:${l.type==="final"||l.type==="cmd"?"600":"400"};
        padding:${l.type==="gap"?"3px 0":"0"};
        opacity:0;animation:fadeInLine .25s forwards;
        letter-spacing:${l.type==="final"?".08em":"0"};
        ${l.type==="final"?"background:rgba(0,220,130,.06);border:1px solid rgba(0,220,130,.14);border-radius:5px;padding:6px 10px;margin-top:4px":""}
      `;
      div.textContent = l.text;
      // cursor only after last non-gap
      if(li >= lines.length){
        const cur = document.createElement("span");
        cur.className = "term-cursor";
        div.appendChild(cur);
      }
      termBody.appendChild(div);
      const delay = l.type==="gap" ? 120 : (l.type==="cmd" ? 600 : 320);
      if(li < lines.length) setTimeout(addLine, delay);
    }
    // inject keyframe
    const st = document.createElement("style");
    st.textContent = "@keyframes fadeInLine{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}";
    document.head.appendChild(st);
    setTimeout(addLine, 900);
  }

  // ── Mobile nav ──
  const toggle = document.querySelector(".nav-toggle");
  const menu   = document.querySelector("#navMenu");
  function closeMenu(){
    if(!menu||!menu.classList.contains("open")) return;
    menu.classList.remove("open");
    toggle?.setAttribute("aria-expanded","false");
  }
  if(toggle&&menu){
    toggle.addEventListener("click",()=>{
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded",String(open));
    });
    menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
    document.addEventListener("click",e=>{
      if(!menu.classList.contains("open")) return;
      if(!menu.contains(e.target)&&!toggle.contains(e.target)) closeMenu();
    });
  }

  // ── Reveal on scroll ──
  const reveals = document.querySelectorAll(".rev");
  const io = new IntersectionObserver(
    e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add("in")),
    {threshold:.08}
  );
  reveals.forEach(el=>io.observe(el));

  // ── Active nav spy ──
  const links = document.querySelectorAll(".n-link");
  const ids = ["home","about","usp","education","skills","experience","services","packages","certificates","testimonials","cta"];
  const sections = ids.map(id=>document.getElementById(id)).filter(Boolean);
  const spy = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      links.forEach(l=>{l.classList.remove("active");l.removeAttribute("aria-current")});
      const a = document.querySelector(`.n-link[href="#${e.target.id}"]`);
      if(a){a.classList.add("active");a.setAttribute("aria-current","page")}
    });
  },{rootMargin:"-40% 0px -55% 0px"});
  sections.forEach(s=>spy.observe(s));

  // ── Cursor glow ──
  const glow = document.getElementById("cursorGlow");
  let mx=0,my=0,af=0;
  function paint(){af=0;if(glow){glow.style.left=mx+"px";glow.style.top=my+"px"}}
  window.addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!af)af=requestAnimationFrame(paint)},{passive:true});

  // ── Copy email ──
  async function copyText(t){
    if(navigator.clipboard) return navigator.clipboard.writeText(t);
    const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;left:-9999px";
    document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);
  }
  const copyBtn=document.getElementById("copyEmail");
  if(copyBtn){
    copyBtn.addEventListener("click",async()=>{
      try{
        await copyText("mohamedalaah5ss@gmail.com");
        const m=document.getElementById("copyMsg");
        if(m){m.classList.remove("hidden");setTimeout(()=>m.classList.add("hidden"),1600)}
      }catch(_){}
    });
  }

  // ── Subtle tilt on cards ──
  const canTilt = window.matchMedia("(pointer:fine)").matches;
  if(canTilt){
    document.querySelectorAll(".usp-card,.sk-card,.exp-card,.proj-card,.svc-card,.pkg-card,.cert-card,.test-card,.cta-card").forEach(card=>{
      card.addEventListener("mousemove",e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`translateY(-2px) perspective(800px) rotateY(${x*4}deg) rotateX(${-y*4}deg)`;
      });
      card.addEventListener("mouseleave",()=>{card.style.transform=""});
    });
  }

  // ── Projects modal ──
  const projects = {
    etl:{
      title:"End-to-End ETL Pipeline",subtitle:"Ingest → Validate → Transform → Load",
      desc:"A complete pipeline workflow: raw inputs → validation rules → clean schema → analytics-ready tables. Built with reproducibility and maintainability as first-class constraints.",
      stack:["Python","SQL","ETL/ELT","Validation","Logging","Git"],
      highlights:[
        "Designed a clean target schema for reporting and consistent KPIs.",
        "Validation checks catch bad inputs early — before they corrupt downstream data.",
        "Structured logs make every run debuggable and auditable.",
        "Full documentation allows anyone to operate the pipeline from day one."
      ],
      repo:"https://github.com/mohamedalaah5ss-oss",docs:"https://github.com/mohamedalaah5ss-oss"
    },
    model:{
      title:"Analytics Data Model",subtitle:"Star schema + metric consistency",
      desc:"A data modeling case study: fact/dimension tables, clear metric definitions, naming standards, and query-performance-aware design — so dashboards stay consistent at scale.",
      stack:["SQL","Star Schema","Dimensions/Facts","KPI Definitions"],
      highlights:[
        "Star schema supports consistent KPIs across all reports.",
        "Clear naming standards and inline documentation.",
        "Optimised for fast analytics queries with minimal joins.",
      ],
      repo:"https://github.com/mohamedalaah5ss-oss",docs:"https://github.com/mohamedalaah5ss-oss"
    },
    quality:{
      title:"Data Quality System",subtitle:"Validation + structured logging",
      desc:"A lightweight quality layer: reusable validation rules, structured error output, and run logs — so failures surface fast and pipelines become trustworthy.",
      stack:["Python","Validation Rules","Structured Logging","Data Quality"],
      highlights:[
        "Reusable checks for the most common data issues.",
        "Standardised error messages to speed up troubleshooting.",
        "Makes pipeline runs predictable and easy to audit."
      ],
      repo:"https://github.com/mohamedalaah5ss-oss",docs:"https://github.com/mohamedalaah5ss-oss"
    }
  };

  const modal   = document.getElementById("projectModal");
  const closeBtn= document.getElementById("closeModal");
  const titleEl = document.getElementById("projectTitle");
  const subEl   = document.getElementById("projectSubtitle");
  const descEl  = document.getElementById("projectDesc");
  const stackEl = document.getElementById("projectStack");
  const hilEl   = document.getElementById("projectHighlights");
  const repoEl  = document.getElementById("projectRepo");
  const docsEl  = document.getElementById("projectDocs");
  let lastFocus = null;

  function openModal(key){
    const p=projects[key]; if(!p||!modal) return;
    lastFocus = document.activeElement;
    titleEl.textContent = p.title;
    subEl.textContent   = p.subtitle;
    descEl.textContent  = p.desc;
    stackEl.innerHTML="";
    p.stack.forEach(s=>{
      const sp=document.createElement("span");sp.className="stag";sp.textContent=s;stackEl.appendChild(sp);
    });
    hilEl.innerHTML="";
    p.highlights.forEach(h=>{
      const li=document.createElement("li");
      li.style.cssText="display:flex;align-items:flex-start;gap:7px";
      li.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:3px;flex-shrink:0"><polyline points="9 18 15 12 9 6"></polyline></svg><span>${h}</span>`;
      hilEl.appendChild(li);
    });
    repoEl.href=p.repo; docsEl.href=p.docs;
    modal.classList.remove("hidden");
    document.body.style.overflow="hidden";
    closeBtn.focus();
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow="";
    lastFocus?.focus?.();
  }
  document.querySelectorAll(".proj-card").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.project)));
  closeBtn?.addEventListener("click",closeModal);
  modal?.addEventListener("click",e=>{if(e.target.dataset.close==="true") closeModal()});
  document.addEventListener("keydown",e=>{if(!modal?.classList.contains("hidden")&&e.key==="Escape") closeModal()});

})();
