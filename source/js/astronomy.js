/**
 * Astronomy Module
 * Handles astronomy-related features and interactions
 */

// 星空绘制参数：每 N 平方 CSS 像素一颗星，并限制上下限（避免超大屏无限增长）
const STAR_AREA_PER_STAR = 9000;
const MIN_STARS = 60;
const MAX_STARS = 220;

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

    // 未开启「减少动效」时才叠加整体明暗呼吸动画：
    // 单个合成层的 opacity 动画，成本远低于上百个节点各自做动画
    if (!this.prefersReducedMotion()) {
      canvas.classList.add('twinkle');
    }

    let resizeTimer = null;

    function draw() {
      // 限制 DPR，避免高分屏下画布像素量成倍膨胀
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = background.clientWidth || window.innerWidth;
      const height = background.clientHeight || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const starCount = Math.min(
        MAX_STARS,
        Math.max(MIN_STARS, Math.round((width * height) / STAR_AREA_PER_STAR))
      );

      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() * 1.1 + 0.3;
        const alpha = Math.random() * 0.6 + 0.25;

        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha.toFixed(2) + ')';
        ctx.fill();
      }
    }

    draw();

    // 视窗变化时重绘（防抖，避免 resize 期间反复绘制）
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 200);
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
    const cards = document.querySelectorAll('.astronomy-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  },

  // Initialize astronomy calendar
  initCalendar() {
    const calendar = document.querySelector('.astronomy-calendar');
    if (!calendar) {
      return;
    }

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

  // Render calendar
  renderCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const grid = document.querySelector('.calendar-grid');
    if (!grid) {
      return;
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

      if (day === today.getDate() && month === today.getMonth()) {
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
    // This would be populated from actual event data
    // For now, return false
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

    // Add events for the day
    // This would be populated from actual event data
    const noEventsMsg = document.createElement('p');
    noEventsMsg.textContent = 'No events for this day';
    eventsContainer.appendChild(noEventsMsg);
  },

  // Navigate to previous month
  previousMonth() {
    // Implementation for previous month navigation
    this.renderCalendar();
  },

  // Navigate to next month
  nextMonth() {
    // Implementation for next month navigation
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
