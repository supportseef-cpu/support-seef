const qs=(s,root=document)=>root.querySelector(s);const qsa=(s,root=document)=>[...root.querySelectorAll(s)];
const header=qs('.site-header'),menuToggle=qs('#menuToggle'),mainNav=qs('#mainNav'),themeToggle=qs('#themeToggle'),themeIcon=qs('.theme-icon'),contactForm=qs('#contactForm'),scrollProgress=qs('#scrollProgress'),backTop=qs('#backTop');

function updateScrollUI(){const y=window.scrollY;header.classList.toggle('scrolled',y>18);backTop.classList.toggle('show',y>650);const max=document.documentElement.scrollHeight-window.innerHeight;scrollProgress.style.width=max>0?`${Math.min(100,(y/max)*100)}%`:'0%'}
window.addEventListener('scroll',updateScrollUI,{passive:true});updateScrollUI();
backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
qsa('.main-nav a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));

// V4 always starts in LIGHT unless the visitor explicitly chooses dark in this version.
const savedTheme=localStorage.getItem('support-seef-theme-v4');if(savedTheme==='dark')document.body.classList.add('dark');
function syncTheme(){const dark=document.body.classList.contains('dark');themeIcon.textContent=dark?'☀':'☾';themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#07111f':'#ffffff')}
syncTheme();themeToggle.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('support-seef-theme-v4',document.body.classList.contains('dark')?'dark':'light');syncTheme()});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.07});qsa('.reveal').forEach(el=>observer.observe(el));
qs('#year').textContent=new Date().getFullYear();

// Active navigation state
const navLinks=qsa('.main-nav a[href^="#"]');const sections=qsa('main section[id]');
const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`))}})},{rootMargin:'-38% 0px -52% 0px',threshold:0});sections.forEach(s=>sectionObserver.observe(s));

// Small hero parallax on pointer devices
const heroShowcase=qs('#heroShowcase');if(heroShowcase&&matchMedia('(pointer:fine)').matches){heroShowcase.addEventListener('pointermove',e=>{const r=heroShowcase.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroShowcase.style.transform=`translate3d(${x*6}px,${y*4}px,0)`});heroShowcase.addEventListener('pointerleave',()=>heroShowcase.style.transform='translate3d(0,0,0)')}

// School screenshot gallery with next / previous navigation
const galleryItems=qsa('.gallery-item'),lightbox=qs('#lightbox'),lightboxImage=qs('#lightboxImage'),lightboxCaption=qs('#lightboxCaption'),lightboxClose=qs('#lightboxClose'),lightboxPrev=qs('#lightboxPrev'),lightboxNext=qs('#lightboxNext');let currentImageIndex=0;
function openLightbox(index){currentImageIndex=index;const item=galleryItems[index],img=qs('img',item);lightboxImage.src=item.dataset.full;lightboxImage.alt=img?.alt||'Project screenshot';lightboxCaption.textContent=img?.alt||'Project screenshot';lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll')}
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');lightboxImage.src='';document.body.classList.remove('no-scroll')}
function stepLightbox(dir){currentImageIndex=(currentImageIndex+dir+galleryItems.length)%galleryItems.length;const item=galleryItems[currentImageIndex],img=qs('img',item);lightboxImage.src=item.dataset.full;lightboxImage.alt=img?.alt||'Project screenshot';lightboxCaption.textContent=img?.alt||'Project screenshot'}
galleryItems.forEach((item,index)=>item.addEventListener('click',()=>openLightbox(index)));lightboxClose.addEventListener('click',closeLightbox);lightboxPrev.addEventListener('click',()=>stepLightbox(-1));lightboxNext.addEventListener('click',()=>stepLightbox(1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

// Project filters + search working together
const cards=qsa('.project-card'),filters=qsa('.filter-btn'),search=qs('#projectSearch'),visibleCount=qs('#visibleCount'),emptyProjects=qs('#emptyProjects');let activeFilter='all';
function applyProjectFilters(){const term=search.value.trim().toLowerCase();let visible=0;cards.forEach(card=>{const categories=card.dataset.category.split(' '),matchesFilter=activeFilter==='all'||categories.includes(activeFilter),haystack=`${card.dataset.title} ${card.dataset.subtitle} ${card.dataset.tech} ${card.textContent}`.toLowerCase(),matchesSearch=!term||haystack.includes(term),show=matchesFilter&&matchesSearch;card.classList.toggle('hidden',!show);if(show)visible++});visibleCount.textContent=visible;emptyProjects.hidden=visible!==0}
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;applyProjectFilters()}));search.addEventListener('input',applyProjectFilters);

// Project detail modal
const modal=qs('#projectModal'),modalClose=qs('#modalClose'),modalCloseSecondary=qs('#modalCloseSecondary'),modalTitle=qs('#modalTitle'),modalSubtitle=qs('#modalSubtitle'),modalDetails=qs('#modalDetails'),modalTech=qs('#modalTech'),modalCta=qs('#modalCta');let lastFocused=null;
function openModal(card){lastFocused=document.activeElement;modalTitle.textContent=card.dataset.title;modalSubtitle.textContent=card.dataset.subtitle;modalDetails.textContent=card.dataset.details;modalTech.innerHTML='';card.dataset.tech.split(' · ').forEach(t=>{const s=document.createElement('span');s.textContent=t;modalTech.appendChild(s)});modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');modalClose.focus()}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll');lastFocused?.focus?.()}
qsa('.project-link').forEach(button=>button.addEventListener('click',()=>openModal(button.closest('.project-card'))));modalClose.addEventListener('click',closeModal);modalCloseSecondary.addEventListener('click',closeModal);modalCta.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(lightbox.classList.contains('open'))closeLightbox();if(modal.classList.contains('open'))closeModal()}if(lightbox.classList.contains('open')&&e.key==='ArrowLeft')stepLightbox(-1);if(lightbox.classList.contains('open')&&e.key==='ArrowRight')stepLightbox(1)});

// WhatsApp project inquiry
contactForm.addEventListener('submit',e=>{e.preventDefault();const name=qs('#name').value.trim(),phone=qs('#phone').value.trim(),email=qs('#email').value.trim(),service=qs('#service').value,message=qs('#message').value.trim();const text=['Hi Support.SEEF,','',`Name: ${name}`,phone?`Phone: ${phone}`:'',email?`Email: ${email}`:'',`Service: ${service}`,'','Project details:',message].filter(Boolean).join('\n');window.open(`https://wa.me/923131022051?text=${encodeURIComponent(text)}`,'_blank','noopener')});
