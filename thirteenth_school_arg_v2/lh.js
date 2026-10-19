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

/* ─────────────── 卡关求助（三条，逐条放出） ───────────────
   第三条里用 %%…%% 包住的部分是答案：先不显示，
   旁边给一个“点击显示答案（这将显示答案！）”的开关，点了才出现。 */
LH.HELP = {
  p1: [
    '密码规则是建站那天定下的，写在本站某一页的维护记录里。',
    '规则是：班号（两位）+ 建站年份（后两位）。班号在首页公告里有，建站年份在首页第一段。',
    '初三（七）班 → 07；本站建于 2001 年 → 01。合起来是：%%0701%%'
  ],
  p2: [
    '管理员备注说过：密码按日期设定，八位数字。',
    '本站只有一个日期是反反复复出现的，就在每一页的最下面。',
    '页脚写着“最后更新时间：2004 年 11 月 17 日”。八位数字是：%%20041117%%'
  ],
  p7: [
    '口令是一个时间，4 位数字，24 小时制。',
    '那天他是放学以后回学校的。冬季放学的钟点，公告里写过。',
    '放 学 17:00。挂钟慢七分钟——挂钟显示 17:00 时，实际已是 17:07。口令是：%%1707%%'
  ],
  b64: [
    '那串字母数字不是乱码，是一种编码。',
    '本站有解码工具，在页脚的“整理工具”里。',
    '复制到“编码转换（Base64）”，点“← 解码”。解码结果是：%%你找不到的东西在 /bak/20041117/%%'
  ],
  rep: [
    '第一问要两个字。姓在档案室，名在备份文件里。',
    '借读材料上写着“沈□”；备份目录 03.txt 里说名字里有个“冬”。别和座号 05 的沈亮弄混。',
    '姓名：%%沈冬%%　　位置：%%后排右起第三%%　　当晚：%%回来过（登记簿上有）%%　　第四问要的是挂钟读数：%%17:00%%（不是 17:07）'
  ]
};
LH._hints = {};

/* 把一条提示里的 %%答案%% 转成「点开才显示」 */
LH.markAnswer = function (key, raw) {
  var segs = String(raw).split('%%');
  var out = '', i, opened = false;
  if (segs.length < 2) { return raw; }
  for (i = 0; i < segs.length; i++) {
    if (i % 2 === 0) {
      out += segs[i];
    } else {
      if (!opened) {
        out += '<span class="anslink"><a href="#" onclick="return LH.reveal(\'' + key + '\')">'
          + '［点击显示答案］</a> <span class="ansnote">（这将显示答案！）</span></span>';
        opened = true;
      }
      out += '<span class="ans">' + segs[i] + '</span>';
    }
  }
  return out;
};

/* 点一下，把这条提示里所有答案一起放出来 */
LH.reveal = function (key) {
  var box = LH.el('helptext-' + key), spans, i, c;
  if (!box) { return false; }
  spans = box.getElementsByTagName('span');
  for (i = 0; i < spans.length; i++) {
    c = spans[i].className || '';
    if (c === 'ans') { spans[i].style.display = 'inline'; spans[i].className = 'ans on'; }
    else if (c === 'anslink') { spans[i].style.display = 'none'; }
  }
  return false;
};

LH.help = function (key) {
  var list = LH.HELP[key] || [];
  var box = LH.el('helptext-' + key);
  var wrap = LH.el('help-' + key);
  var link = wrap ? wrap.getElementsByTagName('a')[0] : null;
  var n = LH._hints[key] || 0;
  var p;
  if (!box || n >= list.length) { return false; }

  p = document.createElement('p');
  p.className = 'helpline';
  p.innerHTML = '<b>提示 ' + (n + 1) + '：</b>' + LH.markAnswer(key, list[n]);
  box.appendChild(p);

  n++;
  LH._hints[key] = n;

  if (link) {
    if (n >= list.length) {
      link.innerHTML = '没有更多提示了';
      link.className = 'helplink off';
      link.onclick = function () { return false; };
    } else {
      link.innerHTML = (n === 1) ? '再看一条' : '最后一条提示';
    }
  }
  return false;
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
  if (parts[0] !== 'LH13') { alert('工作记录无法识别。'); return; }
  var o = LH.load();
  o.seen = parts[1] || '';
  o.gates = parts[2] || '';
  o.tries = parseInt(parts[3], 10) || 0;
  LH.save(o);
  alert('已导入。已查阅 ' + (o.seen ? o.seen.split(',').length : 0) + ' 页。');
  location.reload();
};

LH.reset = function () {
  if (!confirm('清除本机保存的查阅记录？清除后将回到首页，从头开始。')) { return false; }
  LH._mem = { seen: '', tries: 0, gates: '' };
  try { window.localStorage.removeItem(LH.KEY); } catch (e) { }
  document.cookie = LH.KEY + '=;path=/;expires=Thu, 1 Jan 1970 00:00:00 GMT';
  location.href = 'index.html';
  return false;
};
