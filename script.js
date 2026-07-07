
(function(){
  'use strict';

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Back to top button ---------- */
  var toTopBtn = document.getElementById('toTopBtn');
  function updateToTop(){
    if(window.scrollY > 500){ toTopBtn.classList.add('show'); }
    else{ toTopBtn.classList.remove('show'); }
  }
  toTopBtn.addEventListener('click', function(){
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav a[data-nav]'));
  var sections = navLinks.map(function(link){
    return document.getElementById(link.getAttribute('data-nav'));
  }).filter(Boolean);

  function setActiveNav(){
    var scrollPos = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function(sec){
      if(sec.offsetTop <= scrollPos){ current = sec; }
    });
    navLinks.forEach(function(link){
      link.classList.toggle('active', link.getAttribute('data-nav') === current.id);
    });
  }

  var scrollTicking = false;
  function onScroll(){
    if(!scrollTicking){
      window.requestAnimationFrame(function(){
        updateProgress();
        updateToTop();
        setActiveNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- Animated stat counter ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var countersDone = false;
  function runCounters(){
    if(countersDone) return;
    countersDone = true;
    counters.forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var current = 0;
      var duration = 900;
      var startTime = null;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        current = Math.floor(progress * target);
        el.textContent = current;
        if(progress < 1){ window.requestAnimationFrame(step); }
        else{ el.textContent = target; }
      }
      window.requestAnimationFrame(step);
    });
  }
  if(counters.length && 'IntersectionObserver' in window){
    var countIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ runCounters(); countIo.disconnect(); }
      });
    }, { threshold:0.5 });
    counters.forEach(function(el){ countIo.observe(el.closest('.glass') || el); });
  }

  /* ---------- Copy to clipboard + toast for contact chips ---------- */
  var toast = document.getElementById('toast');
  var toastMsg = document.getElementById('toastMsg');
  var toastTimer = null;
  function showToast(msg){
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
  }

  document.querySelectorAll('.contact-chip[data-copy]').forEach(function(chip){
    chip.addEventListener('click', function(e){
      var text = chip.getAttribute('data-copy');
      var label = chip.getAttribute('data-label') || 'Text';
      var href = chip.getAttribute('href') || '';
      // Let mailto: and tel: links behave normally, but also copy to clipboard silently.
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          showToast(label + ' copied — ' + text);
        }).catch(function(){ /* clipboard not available, mailto/tel still works */ });
      }
      // For the location chip (href="#"), prevent jump and just copy.
      if(href === '#'){
        e.preventDefault();
      }
    });
  });

  /* ---------- Smooth scroll offset for fixed nav ---------- */
  navLinks.forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('data-nav');
      var target = document.getElementById(id);
      if(target){
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top:top, behavior:'smooth' });
      }
    });
  });

  /* Init on load */
  updateProgress();
  updateToTop();
  setActiveNav();
})();
