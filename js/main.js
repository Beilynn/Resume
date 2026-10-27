/* ============================================================
   Beilynn 交互式动态简历 · 逻辑层（原生 Vanilla JavaScript）
   ------------------------------------------------------------
   界面方案：整图即界面。
   设计图（img/简历封面.png）铺满作为唯一界面，图内已画好四张票券
   卡片等全部内容；页面用「透明热区」承接图内卡片的交互：
   1. 桌面端：鼠标悬停热区 → 人物切换为对应状态图（1~4.png），
      移开 → 恢复主画面；点击热区 → 毛玻璃遮罩 + 卡片放大弹窗。
   2. 移动端：无鼠标悬停，降级为「点击 / 长按」：
      - 单击热区 = 悬停预览（切换状态图）
      - 再次点击同一热区 / 长按 = 打开详情弹窗
   3. 视线追踪说明（优雅降级方案）：
      - 本站默认输入源为 Pointer Events（鼠标 / 触摸 / 触控笔），
        不依赖任何视线追踪硬件或算法。
      - 交互内核被抽象为两个稳定接口：setState(index) 与
        openDetail(index)。若未来接入视线追踪（如眼动仪 / 摄像头
        gaze 检测），只需让视线落点模块调用这两个接口，渲染层与
        数据层完全无需改动；反之若追踪失败，直接回退到本文件内置
        的鼠标 / 触摸方案即可——交互源可替换，页面行为始终一致。
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 0. 数据与 DOM 引用 ---------- */
  var DATA = window.RESUME_DATA; // 全部文案 / 图片 / 视频 / 热区配置
  if (!DATA) {
    console.error('未找到数据配置，请确认 data/resume-data.js 已正确引入。');
    return;
  }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var frame = $('#posterFrame');        // 海报框
  var stageImg = $('#stageImage');      // 主画面 <img>
  var stateTag = $('#stateTag');        // 当前状态角标
  var hotspotLayer = $('#hotspotLayer');// 热区层容器
  var touchHint = $('#touchHint');      // 移动端提示条
  var overlay = $('#glassOverlay');     // 毛玻璃遮罩
  var modalBody = $('#modalBody');      // 弹窗内容区
  var modalClose = $('#modalClose');    // 关闭按钮
  var videoBtn = $('#videoBtn');        // 视频播放按钮（配置了链接才出现）
  var videoLightbox = $('#videoLightbox'); // 视频灯箱
  var videoEl = $('#videoEl');          // 灯箱内 <video>

  /* ---------- 1. 交互状态 ---------- */
  var state = {
    currentIndex: -1,   // 当前显示的状态图下标，-1 表示主画面
    touchPreview: -1,   // 移动端当前"预览中"的热区下标（再次点击即打开弹窗）
    swapSeq: 0,         // 图片切换序号：防止快速悬停时旧定时器覆盖新图
    lastFocus: null     // 打开弹窗前聚焦的元素（关闭后还原）
  };

  /* 是否为"无法悬停"的触屏设备（手机 / 平板）。检测主输入是否支持
     悬停；带鼠标的触屏笔记本主输入是鼠标，会走桌面逻辑，更合理。 */
  var IS_TOUCH = window.matchMedia && window.matchMedia('(hover: none)').matches;

  /* ---------- 2. 页面初始化 ---------- */

  /* 预加载五张画面（主画面 + 四张状态图），避免切换瞬间出现白屏 */
  function preloadImages() {
    var list = [DATA.media.mainImage].concat(
      DATA.media.states.map(function (s) { return s.image; })
    );
    list.forEach(function (src) {
      var im = new Image();
      im.src = src;
    });
  }

  /* 生成四个透明热区：位置 / 尺寸完全来自配置（百分比），
     因此换图后只需在配置中调整百分比即可重新对准。 */
  function buildHotspots() {
    hotspotLayer.innerHTML = DATA.sections.map(function (sec, i) {
      var h = sec.hotspot || { top: 0, left: 0, width: 20, height: 20 };
      return (
        '<div class="hotspot" data-index="' + i + '" role="button" tabindex="0" ' +
        'aria-label="查看' + sec.title + '详情" title="' + sec.title + '" ' +
        'style="top:' + h.top + '%;left:' + h.left + '%;' +
        'width:' + h.width + '%;height:' + h.height + '%;"></div>'
      );
    }).join('');
  }

  /* ---------- 3. 中央人物画面：状态切换（悬停 / 移动端预览共用） ---------- */

  /**
   * 设置主画面
   * @param {number} index 状态图下标；-1 表示恢复主画面
   */
  function setState(index) {
    var src = (index >= 0 && DATA.media.states[index])
      ? DATA.media.states[index].image
      : DATA.media.mainImage;

    /* 已处于目标状态则直接返回，避免无意义的闪动 */
    if (stageImg.getAttribute('src') === src) {
      updateTag(index);
      return;
    }

    /* 交叉淡入淡出：先淡出（加 is-switching 类），240ms 后换图再淡入 */
    var seq = ++state.swapSeq;
    stageImg.classList.add('is-switching');
    setTimeout(function () {
      if (seq !== state.swapSeq) return; // 期间又发生了新切换，丢弃本次
      stageImg.setAttribute('src', src);
      stageImg.classList.remove('is-switching');
    }, 240);

    /* 海报框"呼吸"微动画（重触发动画） */
    frame.classList.remove('breathe');
    void frame.offsetWidth; // 强制回流以重启动画
    frame.classList.add('breathe');

    updateTag(index);
  }

  /* 更新左上角状态角标：显示"01 · 个人介绍"，主画面时隐藏 */
  function updateTag(index) {
    if (index >= 0 && DATA.media.states[index]) {
      var sec = DATA.sections[index];
      stateTag.textContent = sec.id + ' · ' + sec.title;
      stateTag.classList.add('show');
    } else {
      stateTag.classList.remove('show');
    }
  }

  /* 高亮当前激活的热区（悬停 / 预览） */
  function markActive(index) {
    $$('.hotspot', hotspotLayer).forEach(function (hs, i) {
      hs.classList.toggle('is-active', i === index);
    });
  }

  /* 移动端提示条（短暂出现，引导用户再次点击查看详情） */
  var hintTimer = null;
  function flashTouchHint() {
    touchHint.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      touchHint.classList.remove('show');
    }, 2200);
  }

  /* ---------- 4. 交互绑定：桌面端（悬停 + 点击） ---------- */

  function bindDesktop(hs, index) {
    /* 悬停 → 切换对应状态图 */
    hs.addEventListener('mouseenter', function () {
      setState(index);
      markActive(index);
    });
    /* 移开 → 恢复主画面 */
    hs.addEventListener('mouseleave', function () {
      setState(-1);
      markActive(-1);
    });
    /* 点击 → 毛玻璃弹窗 */
    hs.addEventListener('click', function () { openDetail(index); });
    /* 键盘可达性：回车 / 空格打开弹窗 */
    hs.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(index); }
    });
  }

  /* ---------- 5. 交互绑定：移动端（点击预览 / 再次点击或长按打开） ---------- */

  function bindTouch(hs, index) {
    var pressTimer = null;
    var moved = false;
    var startX = 0;
    var startY = 0;

    hs.addEventListener('pointerdown', function (e) {
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      /* 长按 550ms → 直接打开详情弹窗 */
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () { openDetail(index); }, 550);
    });

    /* 移动超过阈值视为滑动，取消长按与单击判定 */
    hs.addEventListener('pointermove', function (e) {
      if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
        moved = true;
        clearTimeout(pressTimer);
      }
    });

    hs.addEventListener('pointerup', function () {
      clearTimeout(pressTimer);
      if (moved) return; // 是滑动，忽略
      if (overlay.classList.contains('open')) return; // 弹窗已打开时不再处理单击（避免长按开弹窗后误切背景图）

      if (state.touchPreview === index) {
        /* 已预览过该热区 → 再次点击打开详情 */
        openDetail(index);
      } else {
        /* 第一次点击 = 悬停预览：切换状态图 */
        setState(index);
        markActive(index);
        state.touchPreview = index;
        flashTouchHint();
      }
    });

    /* 长按结束时清除计时器，避免误触发 */
    hs.addEventListener('pointercancel', function () { clearTimeout(pressTimer); });
  }

  /* 点击海报其他区域 → 恢复主画面，取消预览态 */
  function bindBackgroundReset() {
    document.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.hotspot')) return; // 点在热区上不处理
      setState(-1);
      markActive(-1);
      state.touchPreview = -1;
    });
  }

  /* ---------- 6. 详情弹窗：毛玻璃遮罩 + 卡片放大 ---------- */

  /* 弹窗内容渲染：按各卡片的 type 分派 */
  function renderSection(sec) {
    var detail = sec.detail;
    if (sec.type === 'profile')   return renderProfile(detail);
    if (sec.type === 'timeline')  return renderTimeline(detail);
    if (sec.type === 'projects')  return renderProjects(detail);
    if (sec.type === 'honors')    return renderHonors(detail);
    return document.createElement('div');
  }

  /* 渲染"小节标题" */
  function blkTitle(text) {
    var h = document.createElement('h3');
    h.className = 'blk-title';
    h.textContent = text;
    return h;
  }

  /* 01 个人介绍 */
  function renderProfile(d) {
    var wrap = document.createElement('div');

    /* 基本信息区：头像 + 键值对 */
    var grid = document.createElement('div');
    grid.className = 'profile-grid';

    var avatar = document.createElement('figure');
    avatar.className = 'profile-avatar';
    var img = document.createElement('img');
    img.src = d.avatar;
    img.alt = '人物立绘';
    img.loading = 'lazy';
    avatar.appendChild(img);

    var basics = document.createElement('ul');
    basics.className = 'basics';
    d.basics.forEach(function (b) {
      var li = document.createElement('li');
      var k = document.createElement('span');
      k.className = 'k';
      k.textContent = b.label;
      var v = document.createElement('span');
      v.className = 'v';
      if (b.href) {
        var link = document.createElement('a');
        link.className = 'v-link';
        link.href = b.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = b.value;
        v.appendChild(link);
      } else {
        v.textContent = b.value;
      }
      li.appendChild(k);
      li.appendChild(v);
      basics.appendChild(li);
    });

    grid.appendChild(avatar);
    grid.appendChild(basics);
    wrap.appendChild(grid);

    /* 教育背景卡片 */
    wrap.appendChild(blkTitle('教育背景'));
    var edu = document.createElement('div');
    edu.className = 'edu-card';
    var row1 = document.createElement('div');
    row1.className = 'row';
    var school = document.createElement('b');
    school.textContent = d.education.school;
    var major = document.createElement('span');
    major.textContent = d.education.major;
    var period = document.createElement('span');
    period.className = 'en';
    period.textContent = d.education.period;
    row1.appendChild(school);
    row1.appendChild(major);
    row1.appendChild(period);

    var gpaLine = document.createElement('div');
    gpaLine.className = 'gpa-line';
    gpaLine.textContent = '平均绩点 ' + d.education.gpa + '　·　' + d.education.rank;

    var courseTags = document.createElement('div');
    courseTags.className = 'course-tags';
    d.education.courses.forEach(function (c) {
      var s = document.createElement('span');
      s.textContent = c;
      courseTags.appendChild(s);
    });

    edu.appendChild(row1);
    edu.appendChild(gpaLine);
    edu.appendChild(courseTags);
    wrap.appendChild(edu);

    /* 自我评价 */
    wrap.appendChild(blkTitle('自我评价'));
    var ev = document.createElement('p');
    ev.className = 'eval-text';
    ev.textContent = d.evaluation;
    wrap.appendChild(ev);

    return wrap;
  }

  /* 02 校园经历（时间线） */
  function renderTimeline(d) {
    var wrap = document.createElement('div');

    if (d.intro) {
      var intro = document.createElement('p');
      intro.className = 'eval-text';
      intro.textContent = d.intro;
      wrap.appendChild(intro);
    }

    var tl = document.createElement('div');
    tl.className = 'timeline';
    d.items.forEach(function (item) {
      var node = document.createElement('div');
      node.className = 'tl-item';

      var t = document.createElement('div');
      t.className = 't';
      t.textContent = item.title;
      if (item.period) {
        var p = document.createElement('span');
        p.className = 'p';
        p.textContent = item.period;
        t.appendChild(p);
      }

      var text = document.createElement('p');
      text.className = 'd';
      text.textContent = item.text;

      node.appendChild(t);
      node.appendChild(text);
      tl.appendChild(node);
    });
    wrap.appendChild(tl);

    /* 可选配图（配置为空数组时不渲染） */
    if (d.gallery && d.gallery.length) {
      var gal = document.createElement('div');
      gal.className = 'tl-gallery';
      d.gallery.forEach(function (src) {
        var fig = document.createElement('figure');
        var im = document.createElement('img');
        im.src = src;
        im.alt = '校园经历配图';
        im.loading = 'lazy';
        fig.appendChild(im);
        gal.appendChild(fig);
      });
      wrap.appendChild(gal);
    }

    return wrap;
  }

  /* 03 GitHub 项目 */
  function renderProjects(d) {
    var wrap = document.createElement('div');

    /* 占位提示（"还在完善中……"） */
    if (d.note) {
      var banner = document.createElement('div');
      banner.className = 'note-banner';
      banner.textContent = d.note;
      wrap.appendChild(banner);
    }

    (d.projects || []).forEach(function (proj) {
      var card = document.createElement('div');
      card.className = 'proj-card';

      var top = document.createElement('div');
      top.className = 'top';
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = proj.name;
      var status = document.createElement('span');
      status.className = 'status';
      status.textContent = proj.status || '状态待补充';
      top.appendChild(name);
      top.appendChild(status);

      var desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = proj.desc;

      var tags = document.createElement('div');
      tags.className = 'proj-tags';
      (proj.tags || []).forEach(function (t) {
        var s = document.createElement('span');
        s.textContent = t;
        tags.appendChild(s);
      });

      var link = document.createElement('a');
      link.className = 'proj-link' + (proj.url && proj.url !== '#' ? '' : ' is-placeholder');
      link.textContent = proj.url && proj.url !== '#' ? (proj.linkText || '查看仓库 →') : '链接待补充';
      if (proj.url && proj.url !== '#') {
        link.href = proj.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(tags);
      card.appendChild(link);
      wrap.appendChild(card);
    });

    return wrap;
  }

  /* 04 荣誉技能 */
  function renderHonors(d) {
    var wrap = document.createElement('div');

    wrap.appendChild(blkTitle('技能能力'));
    (d.skills || []).forEach(function (g) {
      var group = document.createElement('div');
      group.className = 'skill-group';
      var h = document.createElement('h4');
      h.textContent = g.group;
      var chips = document.createElement('div');
      chips.className = 'skill-chips';
      (g.items || []).forEach(function (it) {
        var s = document.createElement('span');
        s.textContent = it;
        chips.appendChild(s);
      });
      group.appendChild(h);
      group.appendChild(chips);
      wrap.appendChild(group);
    });

    wrap.appendChild(blkTitle('荣誉奖项'));
    var list = document.createElement('ul');
    list.className = 'award-list';
    (d.awards || []).forEach(function (a) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = a.name;
      li.appendChild(name);
      if (a.level) {
        var lv = document.createElement('span');
        lv.className = 'lv';
        lv.textContent = a.level;
        li.appendChild(lv);
      }
      list.appendChild(li);
    });
    wrap.appendChild(list);

    return wrap;
  }

  /* 打开详情弹窗 */
  function openDetail(index) {
    var sec = DATA.sections[index];
    if (!sec) return;

    state.lastFocus = document.activeElement;

    /* 弹窗头部（票券样式） */
    var head = document.createElement('div');
    head.className = 'modal-head';
    head.innerHTML =
      '<span class="num">' + sec.id + '</span>' +
      '<span class="zh">' + sec.title + '</span>' +
      '<span class="en">' + sec.enTitle + '</span>' +
      '<span class="modal-barcode"></span>';

    modalBody.innerHTML = '';
    modalBody.appendChild(head);
    modalBody.appendChild(renderSection(sec));

    /* 打开遮罩：毛玻璃 + 卡片放大（动画由 CSS 过渡驱动） */
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    modalClose.focus();
  }

  /* 关闭详情弹窗 */
  function closeModal() {
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    /* 还原焦点 */
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus();
    }
  }

  /* ---------- 7. 视频灯箱（配置了 video.url 才启用） ---------- */

  function initVideo() {
    var v = DATA.video || {};
    if (!v.url) return; // 未配置视频链接 → 隐藏播放按钮，保持画面干净

    videoBtn.classList.add('show');
    videoEl.src = v.url;
    videoEl.poster = v.poster || DATA.media.mainImage;

    videoBtn.addEventListener('click', function () {
      videoLightbox.classList.add('open');
      document.body.classList.add('no-scroll');
      videoEl.play().catch(function () { /* 自动播放被拦截时静默，用户可手动点播放 */ });
    });
    videoLightbox.addEventListener('click', function (e) {
      if (e.target === videoLightbox) closeVideo();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeVideo();
    });
  }

  function closeVideo() {
    videoLightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
    videoEl.pause();
  }

  /* ---------- 8. 启动 ---------- */

  function init() {
    buildHotspots();
    preloadImages();

    /* 键盘 Esc 关闭弹窗 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
    /* 点击遮罩空白处关闭弹窗 */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    modalClose.addEventListener('click', closeModal);

    /* 按设备类型绑定不同的交互方案 */
    var hotspots = $$('.hotspot', hotspotLayer);
    hotspots.forEach(function (hs, index) {
      if (IS_TOUCH) {
        bindTouch(hs, index);
      } else {
        bindDesktop(hs, index);
      }
    });

    bindBackgroundReset();
    initVideo();
  }

  /* DOM 就绪后启动（脚本位于 body 末尾，一般已就绪，仍做一次兜底） */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
