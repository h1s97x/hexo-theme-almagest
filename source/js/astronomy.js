/**
 * Astronomy Module
 * Handles astronomy-related features and interactions
 */

// 星空绘制参数：每 N 平方 CSS 像素一颗星，并限制上下限（避免超大屏无限增长）
const STAR_AREA_PER_STAR = 9000;
const MIN_STARS = 60;
const MAX_STARS = 220;

// 星色调色板：冷白为主，掺少量暖白与蓝紫，避免整片星空「同一个白」
const STAR_COLORS = ['255,255,255', '207,228,255', '184,200,255', '255,233,196', '213,200,255'];

// 流星参数
const METEOR_MIN_INTERVAL = 6000;   // 最短间隔 ms
const METEOR_MAX_INTERVAL = 16000;  // 最长间隔 ms
const METEOR_DURATION = 900;        // 单颗流行存活时长 ms

const Astronomy = {
  // Initialize astronomy features
  init() {
    this.initStarryBackground();
    this.initConstellationNav();
    this.initAstronomyCards();
    this.initCalendar();
  },

  /**
   * 用户是否要求减少动效（系统「减少动态效果」偏好）
   * @returns {boolean}
   */
  prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },

  // Initialize starry background（canvas 单节点绘制，代替上百个 DOM 星点）
  initStarryBackground() {
    const background = document.querySelector('.starry-background');
    if (!background) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'starfield-canvas';
    background.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reduceMotion = this.prefersReducedMotion();

    // 未开启「减少动效」时才叠加整体明暗呼吸动画：
    // 单个合成层的 opacity 动画，成本远低于上百个节点各自做动画
    if (!reduceMotion) {
      canvas.classList.add('twinkle');
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let meteors = [];
    let rafId = null;
    let resizeTimer = null;
    let meteorTimer = null;
    let lastMeteorAt = 0;

    // ---------- 星点构建 ----------

    // 按画布面积计算星数，每颗星持有独立相位/幅度/速度，实现「各自闪烁」
    function buildStars() {
      const count = Math.min(
        MAX_STARS,
        Math.max(MIN_STARS, Math.round((width * height) / STAR_AREA_PER_STAR))
      );

      stars = [];
      for (let i = 0; i < count; i++) {
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.1 + 0.3,
          // 基础亮度与闪烁幅度
          base: Math.random() * 0.45 + 0.3,
          amp: Math.random() * 0.35 + 0.1,
          // 闪烁速度（周期约 1.5s ~ 4.5s）
          spd: Math.random() * 0.9 + 0.35,
          // 相位错开，避免所有星同时亮灭
          ph: Math.random() * Math.PI * 2,
          color: color
        });
      }
    }

    // ---------- 流星 ----------

    function spawnMeteor() {
      // 从画面上半部随机横向位置出发，向右下方划过
      const startX = Math.random() * width * 0.9;
      const startY = Math.random() * height * 0.4;
      const angle = Math.PI / 5 + Math.random() * (Math.PI / 12); // 约 36°~51°
      const len = Math.random() * 90 + 70;
      const speed = Math.random() * 0.35 + 0.5;

      meteors.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        len: len,
        born: performance.now(),
        life: METEOR_DURATION
      });
    }

    function scheduleMeteor() {
      if (reduceMotion) {
        return;
      }
      const delay = METEOR_MIN_INTERVAL + Math.random() * (METEOR_MAX_INTERVAL - METEOR_MIN_INTERVAL);
      meteorTimer = setTimeout(function () {
        spawnMeteor();
        lastMeteorAt = performance.now();
        scheduleMeteor();
      }, delay);
    }

    // ---------- 绘制 ----------

    function drawStars(now) {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // 正弦相位闪烁：alpha 在 [base-amp, base+amp] 间平滑往返
        const t = now / 1000 * s.spd + s.ph;
        let alpha = s.base + Math.sin(t) * s.amp;
        if (alpha < 0.05) alpha = 0.05;
        if (alpha > 1) alpha = 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + s.color + ',' + alpha.toFixed(2) + ')';
        ctx.fill();
      }
    }

    function drawMeteors(now) {
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const age = now - m.born;

        if (age >= m.life) {
          meteors.splice(i, 1);
          continue;
        }

        // 用「已飞过的距离」推进位置
        const traveled = age * m.dx / 16.7;
        const x = m.x + traveled;
        const y = m.y + traveled * (m.dy / m.dx);
        const tailX = x - m.len;
        const tailY = y - m.len * (m.dy / m.dx);

        // 淡入淡出：前 20% 渐显，后 40% 渐隐
        const p = age / m.life;
        let fade = 1;
        if (p < 0.2) fade = p / 0.2;
        else if (p > 0.6) fade = (1 - p) / 0.4;
        if (fade < 0) fade = 0;

        const grad = ctx.createLinearGradient(tailX, tailY, x, y);
        grad.addColorStop(0, 'rgba(103,232,249,0)');
        grad.addColorStop(0.6, 'rgba(150,220,255,' + (0.5 * fade).toFixed(2) + ')');
        grad.addColorStop(1, 'rgba(255,255,255,' + (0.9 * fade).toFixed(2) + ')');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    function frame(now) {
      ctx.clearRect(0, 0, width, height);
      drawStars(now);
      drawMeteors(now);
      rafId = window.requestAnimationFrame(frame);
    }

    // 静态绘制（减少动效 / 页面不可见时只画一帧）
    function drawStatic() {
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);
      drawStars(now);
    }

    // ---------- 尺寸 / 生命周期 ----------

    function resize() {
      // 限制 DPR，避免高分屏下画布像素量成倍膨胀
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // 一律用视口尺寸：.starry-background 是 position:fixed，
      // 若取 clientHeight 会拿到「文档总高度」导致画布被拉长、星点被摊薄。
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();

      if (reduceMotion) {
        drawStatic();
      }
    }

    function start() {
      if (reduceMotion) {
        drawStatic();
        return;
      }
      if (rafId === null) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    start();
    scheduleMeteor();

    // 视窗变化时重建星点（防抖，避免 resize 期间反复绘制）
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    });

    // 标签页切到后台时停帧省电，切回来再续
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
        if (meteorTimer) {
          clearTimeout(meteorTimer);
          meteorTimer = null;
        }
      } else {
        start();
        if (!reduceMotion && !meteorTimer) {
          scheduleMeteor();
        }
      }
    });
  },

  // Initialize constellation navigation
  initConstellationNav() {
    const items = document.querySelectorAll('.constellation-item');
    items.forEach(item => {
      // 不再用 JS 接管点击：锚点本身的 href 跳转即可，
      // 旧实现 preventDefault() 后用可能为 null 的 href 赋值，会跳转到 /null
      item.addEventListener('mouseenter', () => {
        item.classList.add('hover');
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('hover');
      });
    });
  },

  // Initialize astronomy cards
  initAstronomyCards() {
    // 悬停位移已由 `_astronomy.styl` 的 .astronomy-card:hover 提供
    // （translateY(-3px) + 星辉阴影）。原先此处用内联 style 写死
    // translateY(-4px)，会覆盖 CSS 的 hover 规则且无法参与过渡动画，
    // 故移除内联样式接管，仅保留键盘可达性增强。
    const cards = document.querySelectorAll('.astronomy-card');
    cards.forEach(card => {
      if (!card.hasAttribute('tabindex') && card.querySelector('a, button')) {
        return;
      }
      card.setAttribute('tabindex', '0');
    });
  },

  // Initialize astronomy calendar
  initCalendar() {
    const calendar = document.querySelector('.astronomy-calendar');
    if (!calendar) {
      return;
    }

    // 以「今天」为初始视图锚点，翻页时在 view 上偏移
    const today = new Date();
    this._calView = { year: today.getFullYear(), month: today.getMonth() };

    const prevBtn = calendar.querySelector('.calendar-nav button:first-child');
    const nextBtn = calendar.querySelector('.calendar-nav button:last-child');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousMonth());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
    }

    this.renderCalendar();
  },

  // Render calendar（按 this._calView 渲染当前视图月份）
  renderCalendar() {
    const grid = document.querySelector('.calendar-grid');
    if (!grid) {
      return;
    }

    const view = this._calView || (function () {
      const t = new Date();
      return { year: t.getFullYear(), month: t.getMonth() };
    })();
    this._calView = view;

    const { year, month } = view;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // 填充月份标题（原实现从未写入该节点，导致标题常年空白）
    const monthLabel = document.querySelector('.current-month');
    if (monthLabel) {
      monthLabel.textContent = year + ' / ' + String(month + 1).padStart(2, '0');
    }

    // Clear existing days
    const dayElements = grid.querySelectorAll('.calendar-day');
    dayElements.forEach(el => el.remove());

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      grid.appendChild(emptyDay);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = day;

      if (isCurrentMonth && day === today.getDate()) {
        dayElement.classList.add('today');
      }

      // Check if day has events
      if (this.hasEvent(year, month, day)) {
        dayElement.classList.add('has-event');
      }

      dayElement.addEventListener('click', () => {
        this.showDayEvents(year, month, day);
      });

      grid.appendChild(dayElement);
    }
  },

  // Check if day has events
  hasEvent(_year, _month, _day) {
    // 事件数据尚未接入，占位返回 false。
    // 接入真实数据后，此处按 (year, month, day) 查询即可点亮 .has-event。
    return false;
  },

  // Show events for a specific day
  showDayEvents(_year, _month, _day) {
    const eventsContainer = document.querySelector('.calendar-events');
    if (!eventsContainer) {
      return;
    }

    // Clear existing events
    eventsContainer.innerHTML = '';

    // 事件数据尚未接入，占位提示。
    const noEventsMsg = document.createElement('p');
    noEventsMsg.textContent = window.__almagestNoEventsText || 'No events for this day';
    eventsContainer.appendChild(noEventsMsg);
  },

  // Navigate to previous month（真实翻页并重绘）
  previousMonth() {
    const view = this._calView;
    if (!view) {
      return;
    }
    view.month -= 1;
    if (view.month < 0) {
      view.month = 11;
      view.year -= 1;
    }
    this.renderCalendar();
  },

  // Navigate to next month（真实翻页并重绘）
  nextMonth() {
    const view = this._calView;
    if (!view) {
      return;
    }
    view.month += 1;
    if (view.month > 11) {
      view.month = 0;
      view.year += 1;
    }
    this.renderCalendar();
  },

  // Get current constellation based on date
  getConstellationByDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const constellations = [
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
    ];

    for (const constellation of constellations) {
      const [startMonth, startDay] = constellation.start;
      const [endMonth, endDay] = constellation.end;

      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return constellation.name;
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return constellation.name;
        }
      }
    }

    return null;
  },

  // Calculate visible constellations for a location
  getVisibleConstellations(_latitude, _longitude, date) {
    // This is a simplified implementation
    // In a real application, you would use astronomical calculations
    const constellation = this.getConstellationByDate(date);
    return constellation ? [constellation] : [];
  },

  // Get observation tips for a location
  getObservationTips(latitude, _longitude, _date) {
    const tips = [];

    // Add tips based on location and date
    if (latitude > 0) {
      tips.push('Best viewing time: After midnight');
    } else {
      tips.push('Best viewing time: Before midnight');
    }

    tips.push('Use a telescope for better views');
    tips.push('Avoid light pollution areas');
    tips.push('Check weather conditions before observing');

    return tips;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Astronomy.init();
  });
} else {
  Astronomy.init();
}
