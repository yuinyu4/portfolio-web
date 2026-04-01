/**
 * 포트폴리오 script.js
 * ───────────────────────────────────────────
 * 1. 커스텀 커서
 * 2. 네비게이션 (스크롤 감지 + 모바일 메뉴)
 * 3. 스크롤 reveal 애니메이션
 * 4. 숫자 카운터 애니메이션
 * 5. 스킬 바 애니메이션
 * 6. 사진 라이트박스
 * 7. 유틸리티
 */

/* ══════════════════════════════════════════
   1. 커스텀 커서
══════════════════════════════════════════ */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  // 터치 기기에서는 커서를 숨기고 종료
  if (!cursor || !follower || window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  // 마우스 이동: 커서는 즉시, 팔로워는 lerp(선형 보간)로 부드럽게
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // 팔로워 부드럽게 따라오기 (rAF 루프)
  function animateFollower() {
    // lerp: 현재 위치에서 목표 위치로 10% 이동
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // 링크/버튼 위에서 커서 크기 변경
  const interactables = 'a, button, .photo-item, .project-card, .contact-card, .skill-block';
  document.querySelectorAll(interactables).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ══════════════════════════════════════════
   2. 네비게이션
══════════════════════════════════════════ */
(function initNav() {
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!nav) return;

  // 스크롤 시 nav 배경 추가
  const handleScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // 모바일 메뉴 토글
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      // 메뉴 열릴 때 body 스크롤 막기
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // 모바일 링크 클릭 시 메뉴 닫기
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }
})();


/* ══════════════════════════════════════════
   3. 스크롤 Reveal 애니메이션
══════════════════════════════════════════ */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // IntersectionObserver: 뷰포트에 들어올 때 visible 추가
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // 한 번 보이면 감시 중단 (성능 최적화)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // 12% 보일 때 트리거
      rootMargin: '0px 0px -40px 0px'  // 하단 40px 여유
    }
  );

  revealEls.forEach(el => observer.observe(el));

  // 히어로 섹션은 페이지 로드 즉시 표시
  const heroReveals = document.querySelectorAll('.hero .reveal');
  setTimeout(() => {
    heroReveals.forEach(el => el.classList.add('visible'));
  }, 100);
})();


/* ══════════════════════════════════════════
   4. 숫자 카운터 애니메이션
══════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // 특수 값(∞)은 바로 표시
        if (el.dataset.special) {
          el.textContent = el.dataset.target;
          observer.unobserve(el);
          return;
        }

        const target  = parseInt(el.dataset.target, 10);
        const duration = 1200; // ms
        const startTime = performance.now();

        // easeOutExpo 이징
        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function tick(currentTime) {
          const elapsed  = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const value    = Math.round(easeOutExpo(progress) * target);
          el.textContent = value;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════
   5. 스킬 바 애니메이션
══════════════════════════════════════════ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill[data-width]');
  if (!fills.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // data-width 값을 width %로 설정 → CSS transition이 애니메이션
        el.style.width = el.dataset.width + '%';
        observer.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════
   6. 사진 라이트박스
══════════════════════════════════════════ */
(function initLightbox() {
  const lightbox        = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn        = document.getElementById('lightboxClose');
  const prevBtn         = document.getElementById('lightboxPrev');
  const nextBtn         = document.getElementById('lightboxNext');
  const photoItems      = document.querySelectorAll('.photo-item');

  if (!lightbox || !photoItems.length) return;

  let currentIndex = 0;

  // 사진 데이터 수집 (캡션 + 플레이스홀더 HTML)
  const photos = Array.from(photoItems).map(item => ({
    caption: item.dataset.caption || '',
    // 실제 이미지 src가 있으면 사용, 없으면 플레이스홀더 복제
    imgSrc: item.querySelector('img')?.src || null,
    placeholder: item.querySelector('.photo-placeholder')?.outerHTML || null,
    style: item.querySelector('.photo-placeholder')?.getAttribute('style') || ''
  }));

  // 라이트박스 표시
  function openLightbox(index) {
    currentIndex = index;
    renderLightboxContent();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // 닫기 버튼에 포커스
    closeBtn.focus();
  }

  // 라이트박스 닫기
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // 원래 클릭한 사진으로 포커스 복귀
    photoItems[currentIndex]?.focus();
  }

  // 라이트박스 콘텐츠 렌더링
  function renderLightboxContent() {
    const photo = photos[currentIndex];
    lightboxCaption.textContent = photo.caption;

    if (photo.imgSrc) {
      // 실제 이미지
      lightboxContent.innerHTML = `<img src="${photo.imgSrc}" alt="${photo.caption}" style="max-width:85vw; max-height:80vh; border-radius:12px; display:block;" />`;
    } else if (photo.placeholder) {
      // 플레이스홀더 그라디언트를 라이트박스용으로 크게 표시
      lightboxContent.innerHTML = `
        <div class="lightbox-placeholder" style="${photo.style}; background: linear-gradient(135deg, var(--ph-a, #1a1a2e), var(--ph-b, #302b63), var(--ph-c, #0f0c29));">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56" style="opacity:0.4">
            <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
          </svg>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; letter-spacing:0.06em; color:rgba(255,255,255,0.4);">
            ${photo.caption}
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.65rem; color:rgba(255,255,255,0.2); margin-top:4px;">
            /images/ 폴더에 실제 사진을 추가하세요
          </span>
        </div>`;

      // CSS 변수 직접 주입 (플레이스홀더 색상)
      const div = lightboxContent.querySelector('.lightbox-placeholder');
      if (div && photo.style) {
        const vars = photo.style.split(';').filter(Boolean);
        vars.forEach(v => {
          const [key, val] = v.split(':');
          if (key && val) div.style.setProperty(key.trim(), val.trim());
        });
        // 그라디언트 직접 설정
        const style = getComputedStyle(photoItems[currentIndex].querySelector('.photo-placeholder'));
        div.style.background = `linear-gradient(135deg, ${div.style.getPropertyValue('--ph-a')}, ${div.style.getPropertyValue('--ph-b')}, ${div.style.getPropertyValue('--ph-c')})`;
      }
    }
  }

  // 이전/다음
  function goNext() {
    currentIndex = (currentIndex + 1) % photos.length;
    renderLightboxContent();
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    renderLightboxContent();
  }

  // 이벤트: 사진 클릭
  photoItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    // 키보드 접근성
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `사진 보기: ${item.dataset.caption || ''}`);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // 배경 클릭으로 닫기
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  // 터치 스와이프
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  }, { passive: true });
})();


/* ══════════════════════════════════════════
   7. 유틸리티
══════════════════════════════════════════ */

// 활성 내비게이션 링크 하이라이트 (스크롤 위치 기반)
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--text-primary)';
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
})();

// 페이지 로드 완료 후 overflow 초기화 (모바일 메뉴가 열린 상태로 리로드됐을 때 방어)
window.addEventListener('load', () => {
  document.body.style.overflow = '';
});
