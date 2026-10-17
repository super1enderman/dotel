/* 临河十三中 · 站点脚本 lh.js
   本文件按 ES3 语法书写，IE6 / IE8 / 现代浏览器均可运行。
   不发起任何网络请求，不读取任何本地文件。 */

var LH = {};

/* ─────────────── 答案与数据 ─────────────── */
LH.ANSWERS = {
  p1: ['0701'],
  p2: ['20041117'],
  p7: ['1707']
};

LH.MSG = {
  p1: '密码不正确。密码规则见“网页维护”页的维护记录。',
  p2: '密码不正确。提示：本站停止更新的日期。',
  p7: '时间不正确。请先确认挂钟与实际时间的差别。'
};

/* ─────────────── 基础工具 ─────────────── */
LH.isArray = function (o) { return Object.prototype.toString.call(o) === '[object Array]'; };

LH.el = function (id) { return document.getElementById(id); };

/* 只保留数字 */
LH.digits = function (s) {
  var out = '', i, c, n;
  if (!s) { return ''; }
  s = String(s);
  for (i = 0; i < s.length; i++) {
    c = s.charAt(i);
    n = s.charCodeAt(i);
    if (n >= 48 && n <= 57) { out += c; }                 /* 0-9 */
    else if (n >= 65296 && n <= 65305) {                  /* 全角 ０-９ */
      out += String.fromCharCode(n - 65248);
    }
  }
  return out;
};

/* 只保留汉字 */
LH.cjk = function (s) {
  var out = '', i, n;
  if (!s) { return ''; }
  s = String(s);
  for (i = 0; i < s.length; i++) {
    n = s.charCodeAt(i);
    if (n >= 0x4e00 && n <= 0x9fa5) { out += s.charAt(i); }
  }
  return out;
};

/* 去空白 */
LH.trim = function (s) {
  if (!s) { return ''; }
  s = String(s).replace(/^[\s\u3000]+/, '').replace(/[\s\u3000]+$/, '');
  return s;
};

/* ─────────────── 存取（localStorage → cookie → 内存） ─────────────── */
LH.KEY = 'lh13_v1';
LH._mem = null;

LH.load = function () {
  var raw = null, t, pair;
  if (LH._mem) { return LH._mem; }
  try {
    if (window.localStorage) { raw = window.localStorage.getItem(LH.KEY); }
  } catch (e) { raw = null; }
  if (!raw) {
    t = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < t.length; i++) {
      pair = t[i].replace(/^\s+/, '');
      if (pair.indexOf(LH.KEY + '=') === 0) {
        raw = decodeURIComponent(pair.substring(LH.KEY.length + 1));
        break;
      }
    }
  }
  if (!raw) { LH._mem = { seen: '', tries: 0, gates: '' }; return LH._mem; }
  try {
    LH._mem = LH.parse(raw);
  } catch (e2) {
    LH._mem = { seen: '', tries: 0, gates: '' };
  }
  return LH._mem;
};

LH.parse = function (raw) {
  var o = { seen: '', tries: 0, gates: '' }, parts, i, kv;
  parts = raw.split('&');
  for (i = 0; i < parts.length; i++) {
    kv = parts[i].split('=');
    if (kv[0] === 'seen') { o.seen = decodeURIComponent(kv[1] || ''); }
    if (kv[0] === 'tries') { o.tries = parseInt(kv[1], 10) || 0; }
    if (kv[0] === 'gates') { o.gates = decodeURIComponent(kv[1] || ''); }
  }
  return o;
};

LH.save = function (o) {
  var raw;
  LH._mem = o;
  raw = 'seen=' + encodeURIComponent(o.seen) + '&tries=' + o.tries + '&gates=' + encodeURIComponent(o.gates);
  try {
    if (window.localStorage) { window.localStorage.setItem(LH.KEY, raw); return; }
  } catch (e) { /* 继续尝试 cookie */ }
  try {
    document.cookie = LH.KEY + '=' + encodeURIComponent(raw) + ';path=/;expires=Tue, 1 Jan 2030 00:00:00 GMT';
  } catch (e2) { /* 内存模式 */ }
};

/* ─────────────── 启动 ─────────────── */
LH.boot = function (name) {
  LH.mark(name);
  LH.ticker();
  LH.blink();
};

/* ─────────────── 公告条：低帧率走马灯 ───────────────
   早期的 JS 滚动条是 setInterval 一格一格推的，看起来一跳一跳。
   这里固定每 250ms 推 6px（约 4 帧/秒），刻意保持这种粗糙感。
   JS 不执行时文字保持静态可见，不会变成空条。 */
LH.ticker = function () {
  var box = LH.el('tk'), txt = LH.el('tkx');
  if (!box || !txt) { return; }
  var w = box.offsetWidth;
  if (!w) { return; }

  /* 条内有同样的两节文字，位移动满一节就回退一节，形成无缝循环 */
  var parts = txt.getElementsByTagName('span');
  var unit = (parts.length > 1) ? parts[0].offsetWidth : (txt.offsetWidth || 600);
  if (!unit) { unit = 600; }
  var step = 6;        /* 每帧移动像素 */
  var frame = 250;     /* 每帧间隔毫秒，约 4 帧/秒 —— 刻意保留低帧率的粗糙感 */
  var pos = 0;         /* 从 0 开始：条里始终有字，不会先空一段再滚进来 */

  /* 用 margin-left 位移：IE6 对表格单元格内的 position:relative 支持有缺陷 */
  txt.style.display = 'block';
  txt.style.marginLeft = pos + 'px';

  var move = function () {
    pos -= step;
    if (pos <= -unit) { pos += unit; }
    txt.style.marginLeft = Math.floor(pos) + 'px';
  };
  window.setInterval(move, frame);
};

/* ─────────────── NEW 图标：老式闪动 ───────────────
   2003 年的站点常用闪烁的 NEW 小图。这里用定时器开关 visibility，
   周期 500ms，亮两拍停一拍（亮 1s、灭 0.5s），不做高频闪烁。 */
LH.blink = function () {
  var imgs = document.getElementsByTagName('img');
  var list = [], i, n = 0;
  for (i = 0; i < imgs.length; i++) {
    if (imgs[i].src && imgs[i].src.indexOf('new.gif') > -1) {
      list[n++] = imgs[i];
    }
  }
  if (!n) { return; }
  var tick = 0;
  window.setInterval(function () {
    tick = (tick + 1) % 3;
    var show = (tick !== 2);
    for (var k = 0; k < list.length; k++) {
      list[k].style.visibility = show ? 'visible' : 'hidden';
    }
  }, 500);
};

/* ─────────────── 已查阅页数 ─────────────── */
LH.mark = function (name) {
  var o = LH.load(), list, i, found = false, n;
  if (!name) { return; }
  list = o.seen ? o.seen.split(',') : [];
  for (i = 0; i < list.length; i++) { if (list[i] === name) { found = true; } }
  if (!found) {
    if (list.length < 200) { list.push(name); }
    o.seen = list.join(',');
    LH.save(o);
  }
  n = LH.el('seenCount');
  if (n) { n.innerHTML = String(list.length); }
};

/* ─────────────── 闸门校验 ─────────────── */
LH.gate = function (form, key) {
  var inp = form.elements['pw'], v, want, i, ok = false, box, o;
  if (!inp) { return false; }
  v = LH.digits(inp.value);
  want = LH.ANSWERS[key] || [];
  for (i = 0; i < want.length; i++) { if (v === want[i]) { ok = true; } }

  box = LH.el('err-' + key);
  if (!ok) {
    if (box) {
      box.innerHTML = LH.MSG[key] || '输入不正确。';
      box.style.display = 'block';
    }
    inp.focus();
    return false;
  }
  o = LH.load();
  o.gates = (o.gates ? o.gates + ',' : '') + key;
  LH.save(o);
  window.location.href = form.getAttribute('data-next') || form.action;
  return false;
};

/* ─────────────── 站内跳转 ─────────────── */
LH.jump = function (form) {
  var p = LH.trim(form.elements['p'].value);
  if (!p) { return false; }
  if (p.charAt(0) === '/' || p.charAt(0) === '\\') { p = p.substring(1); }
  p = p.replace(/^\.\//, '');
  window.location.href = p;
  return false;
};

/* ─────────────── 留言板提交（不会真正写入） ─────────────── */
LH.post = function (form) {
  var nick = LH.trim(form.elements['nick'].value);
  var msg = LH.trim(form.elements['msg'].value);
  var box = LH.el('postmsg');
  if (!msg) {
    if (box) { box.className = 'err'; box.innerHTML = '留言内容不能为空。'; }
    return false;
  }
  if (box) {
    box.className = 'ok';
    box.innerHTML = '留言提交成功。'
      + '<br>昵称：' + (nick || '匿名')
      + '<br>您的留言已进入审核队列。当前队列中有 <b>1</b> 条未审核留言'
      + '（提交时间：2004-07-05 09:41）。'
      + '<br><span class="small gray">本站自 2004 年 11 月 17 日起不再审核新留言。</span>';
  }
  return false;
};

/* ─────────────── Base64（含 UTF-8 转换，兼容 IE6） ─────────────── */
LH.B64CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

LH.utf8 = function (s) {
  var out = '', i, c;
  for (i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c < 128) {
      out += s.charAt(i);
    } else if (c < 2048) {
      out += String.fromCharCode(192 | (c >> 6), 128 | (c & 63));
    } else {
      out += String.fromCharCode(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
  }
  return out;
};

LH.unutf8 = function (s) {
  var out = '', i = 0, c, c2, c3;
  while (i < s.length) {
    c = s.charCodeAt(i);
    if (c < 128) { out += String.fromCharCode(c); i++; }
    else if (c < 224) {
      c2 = s.charCodeAt(i + 1);
      out += String.fromCharCode(((c & 31) << 6) | (c2 & 63)); i += 2;
    } else {
      c2 = s.charCodeAt(i + 1); c3 = s.charCodeAt(i + 2);
      out += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)); i += 3;
    }
  }
  return out;
};

LH.b64enc = function (str) {
  var s = LH.utf8(str), out = '', i, a, b, c;
  for (i = 0; i < s.length; i += 3) {
    a = s.charCodeAt(i);
    b = s.charCodeAt(i + 1);
    c = s.charCodeAt(i + 2);
    out += LH.B64CHARS.charAt(a >> 2);
    out += LH.B64CHARS.charAt(((a & 3) << 4) | (isNaN(b) ? 0 : b >> 4));
    out += isNaN(b) ? '=' : LH.B64CHARS.charAt(((b & 15) << 2) | (isNaN(c) ? 0 : c >> 6));
    out += isNaN(c) ? '=' : LH.B64CHARS.charAt(c & 63);
  }
  return out;
};

LH.b64dec = function (str) {
  var s = String(str).replace(/[^A-Za-z0-9+\/=]/g, '');
  var out = '', i, a, b, c, d, n;
  for (i = 0; i < s.length; i += 4) {
    a = LH.B64CHARS.indexOf(s.charAt(i));
    b = LH.B64CHARS.indexOf(s.charAt(i + 1));
    c = s.charAt(i + 2) === '=' ? -1 : LH.B64CHARS.indexOf(s.charAt(i + 2));
    d = s.charAt(i + 3) === '=' ? -1 : LH.B64CHARS.indexOf(s.charAt(i + 3));
    if (a < 0 || b < 0) { break; }
    n = (a << 18) | (b << 12) | ((c < 0 ? 0 : c) << 6) | (d < 0 ? 0 : d);
    out += String.fromCharCode((n >> 16) & 255);
    if (c >= 0) { out += String.fromCharCode((n >> 8) & 255); }
    if (d >= 0) { out += String.fromCharCode(n & 255); }
  }
  return LH.unutf8(out);
};

LH.b64 = function (dir) {
  var s = LH.el('b64src'), o = LH.el('b64out');
  if (!s || !o) { return; }
  if (dir === 'clr') { s.value = ''; o.value = ''; return; }
  if (dir === 'enc') { o.value = LH.b64enc(s.value); }
  else { o.value = LH.b64dec(s.value); }
};

/* ─────────────── ASCII 转换 ─────────────── */
LH.ascii = function () {
  var n = LH.el('asciiN'), o = LH.el('asciiOut');
  var v = parseInt(LH.digits(n.value), 10);
  if (isNaN(v) || v < 32 || v > 126) { o.innerHTML = '请输入 32—126 之间的数字。'; return; }
  o.innerHTML = '“' + '<code>' + String.fromCharCode(v) + '</code>' + '”';
};

/* ─────────────── 结案报告 ─────────────── */
LH.report = function (form) {
  var q1 = LH.cjk(form.elements['q1'].value);
  var q2 = LH.radio(form, 'q2');
  var q3 = LH.radio(form, 'q3');
  var q4 = LH.digits(form.elements['q4'].value);

  var ok1 = (q1 === '沈冬' || q1 === '沈小冬');
  var ok2 = (q2 === 'c');
  var ok3 = (q3 === 'b');
  var ok4 = (q4 === '1700');

  var o = LH.load(), out = LH.el('reportOut');
  o.tries = (o.tries || 0) + 1;
  LH.save(o);

  LH.show('r-pass', false); LH.show('r-namefail', false); LH.show('r-fail', false);

  if (ok1 && ok2 && ok3) {
    LH.show('r-pass', true);
    LH.show('btnB', true);
    LH.show('btnC', !!ok4);
    LH.show('cHint', !ok4);
    var tc = LH.el('tryCount');
    if (tc) { tc.innerHTML = String(o.tries); }
    LH.scrollToEl('reportOut');
  } else if (!ok1 && ok2 && ok3) {
    LH.show('r-namefail', true);
    LH.scrollToEl('reportOut');
  } else {
    LH.show('r-fail', true);
    LH.scrollToEl('reportOut');
  }
  return false;
};

LH.radio = function (form, name) {
  var r = form.elements[name], i;
  if (!r) { return ''; }
  if (r.length === undefined) { return r.checked ? r.value : ''; }
  for (i = 0; i < r.length; i++) { if (r[i].checked) { return r[i].value; } }
  return '';
};

LH.show = function (id, on) {
  var e = LH.el(id);
  if (e) { e.style.display = on ? '' : 'none'; }
};

LH.scrollToEl = function (id) {
  var e = LH.el(id);
  if (!e) { return; }
  try { e.scrollIntoView(false); } catch (err) { }
};

/* ─────────────── 进度码 ─────────────── */
LH.exportCode = function () {
  var o = LH.load();
  var ta = LH.el('codeBox');
  if (ta) {
    ta.value = LH.b64enc('LH13|' + o.seen + '|' + o.gates + '|' + o.tries);
  }
};

LH.importCode = function () {
  var ta = LH.el('codeBox'), s, parts;
  if (!ta || !ta.value) { return; }
  s = LH.b64dec(ta.value);
  parts = s.split('|');
  if (parts[0] !== 'LH13') { alert('进度码无法识别。'); return; }
  var o = LH.load();
  o.seen = parts[1] || '';
  o.gates = parts[2] || '';
  o.tries = parseInt(parts[3], 10) || 0;
  LH.save(o);
  alert('进度已导入。已查阅 ' + (o.seen ? o.seen.split(',').length : 0) + ' 页。');
  location.reload();
};

LH.reset = function () {
  if (!confirm('确定清除本机保存的查阅记录吗？')) { return; }
  LH._mem = { seen: '', tries: 0, gates: '' };
  try { window.localStorage.removeItem(LH.KEY); } catch (e) { }
  document.cookie = LH.KEY + '=;path=/;expires=Thu, 1 Jan 1970 00:00:00 GMT';
  location.reload();
};
