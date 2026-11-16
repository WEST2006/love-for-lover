import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  isCloudStorageEnabled,
  loadPersistedStore,
  persistStoreData,
} from './storeAdapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const PORT = Number(process.env.PORT || 3001);
const DEFAULT_PASSCODE = process.env.LOVE_PASSCODE || '5201314';

const QUESTION_BANK = [
  '如果今晚能瞬间移动到我身边 30 分钟，你最想一起做什么？',
  '回忆一下我们在重庆、成都、南京、石家庄里最让你嘴角上扬的一个瞬间？',
  '我做过哪件很小的事，曾经悄悄让你觉得“就是你了”？',
  '如果以后我们能每天同城下班回家，你最期待晚饭后的哪半小时？',
  '吵架或闹别扭的时候，你其实最希望我用哪种方式先哄你？',
  '最近有没有一首歌、一道菜或一个画面，让你突然很想我？',
  '如果下一次旅行要挑一个没去过的城市，你第一反应会选哪里？',
  '你觉得这段异地时光里，我们身上最值得互相夸奖的一点是什么？',
  '在我所有的习惯或小动作里，你最偏爱哪一个？',
  '写下一件你现在想做、希望我陪你一起完成的小愿望？',
  '如果把我们的感情比作一种天气或一种食物，你会选什么？',
  '忙到很累、电量见底的时候，我做什么会让你瞬间回血？',
  '下一次见面拥抱的时候，第一句话想在彼此耳边说什么？',
  '有没有哪张我们一起拍过的照片，你到现在偶尔还会翻出来看？',
];

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createDefaultStore() {
  const now = Date.now();
  return {
    security: {
      passcode: DEFAULT_PASSCODE,
      isDefaultPasscode: DEFAULT_PASSCODE === '5201314',
      secret: crypto.randomBytes(24).toString('hex'),
    },
    couple: {
      title: '我们的心动小屋',
      anniversaryDate: '',
      reunionDate: '',
      loveQuote: '所爱隔山海，山海皆可平',
      distanceKm: 0,
      appPublicUrl: '',
    },
    partners: {
      him: {
        id: 'him',
        name: '男朋友',
        city: '',
        avatarEmoji: '他',
        mood: 'miss',
        moodUpdatedAt: now,
        missCountToday: 0,
        lastPulseAt: 0,
        angerLevel: 0,
        sootheCount: 0,
        pushUrl: '',
      },
      her: {
        id: 'her',
        name: '女朋友',
        city: '',
        avatarEmoji: '她',
        mood: 'miss',
        moodUpdatedAt: now,
        missCountToday: 0,
        lastPulseAt: 0,
        angerLevel: 0,
        sootheCount: 0,
        pushUrl: '',
      },
    },
    todayDate: getTodayStr(),
    telepathyCount: 0,
    lastTelepathyAt: 0,
    polaroid: {
      id: `pol-${now}`,
      author: 'her',
      imageData: '',
      caption: '想把每一个此刻，都拍下来寄给你',
      cityTag: '此刻',
      createdAt: now,
      stamps: [],
    },
    polaroidHistory: [],
    cities: [
      {
        id: 'chongqing',
        name: '重庆',
        subtitle: '两江灯火 · 雾夜山城',
        tagline: '走过山城高低错落的台阶，牵着你的手就从不觉得远',
        memory: '两江交汇的晚风、依山而建的霓虹夜色，还有热辣滚烫的烟火气。',
        dateLabel: '曾一起去过',
        accent: '#C9485B',
        badge: '山城',
        photo: '',
        photos: [],
      },
      {
        id: 'chengdu',
        name: '成都',
        subtitle: '温柔晚风 · 慢下来的甜',
        tagline: '好想把往后的日常，也过成成都街头那样悠长温柔的甜',
        memory: '街头巷尾的美食香气、并肩慢慢散步的夜晚，风里都是松弛与开心。',
        dateLabel: '曾一起去过',
        accent: '#D4765A',
        badge: '蓉城',
        photo: '',
        photos: [],
      },
      {
        id: 'nanjing',
        name: '南京',
        subtitle: '梧桐光影 · 秦淮夜色',
        tagline: '金陵城满街的梧桐树影，都替我们记住了那天的笑声',
        memory: '树影斑驳的街道、傍晚柔和的天色，每一步都舍不得走得太快。',
        dateLabel: '曾一起去过',
        accent: '#C76D52',
        badge: '金陵',
        photo: '',
        photos: [],
      },
      {
        id: 'shijiazhuang',
        name: '石家庄',
        subtitle: '北方风物 · 踏实陪伴',
        tagline: '最让人心安的浪漫，是有你在身边的每一个寻常朝暮',
        memory: '北方朗阔的天空、握紧在手心的温度，只要你在，哪里都是好风景。',
        dateLabel: '曾一起去过',
        accent: '#B5526B',
        badge: '石门',
        photo: '',
        photos: [],
      },
    ],
    nextCity: {
      name: '下一站 · 等我们一起出发',
      note: '把下一次想共同奔赴的城市与心愿写在这里',
    },
    coupons: [
      {
        id: 'hug',
        title: '马上抱抱券',
        emoji: '🫂',
        desc: '不管正在忙什么，看到后立刻发语音抱抱我一分钟',
        activeRequest: null,
        usedCount: 0,
      },
      {
        id: 'peace',
        title: '停止生气券',
        emoji: '🍬',
        desc: '遇到小别扭立刻休战，先好好哄哄再讲道理',
        activeRequest: null,
        usedCount: 0,
      },
      {
        id: 'milk_tea',
        title: '奶茶投喂券',
        emoji: '🧋',
        desc: '立刻给对方点一杯今天最想喝的小甜水',
        activeRequest: null,
        usedCount: 0,
      },
      {
        id: 'call',
        title: '随时连麦券',
        emoji: '📞',
        desc: '不用一直找话题，挂着听听彼此的声音也好',
        activeRequest: null,
        usedCount: 0,
      },
    ],
    questionState: {
      index: 0,
      current: {
        id: `q-${now}`,
        prompt: QUESTION_BANK[0],
        answers: { him: '', her: '' },
        updatedAt: now,
      },
      history: [],
    },
    wishlist: [
      {
        id: `w-${now}-1`,
        text: '下次见面先结结实实抱够三分钟',
        cityTag: '见面必做',
        done: false,
        by: 'her',
        createdAt: now,
      },
      {
        id: `w-${now}-2`,
        text: '选一个新城市，再添一张新的明信片',
        cityTag: '下一站',
        done: false,
        by: 'him',
        createdAt: now,
      },
    ],
    emotionControl: {
      cooldownUntil: 0,
      cooldownBy: '',
      peaceProposalBy: '',
      peaceNotes: {
        him: '如果哪天我惹你生气了，记住我是真的很想和你好好的，只是有时候笨嘴拙舌。',
        her: '如果我气鼓鼓不说话，其实不是不爱你了，只是需要你多抱抱我、顺顺毛。',
      },
      recentSoothes: [],
    },
    recentEvents: [
      {
        id: `evt-${now}`,
        by: 'her',
        text: '把重庆、成都、南京、石家庄的旅行足迹放进了小屋',
        emoji: '✦',
        createdAt: now,
      },
    ],
  };
}

function migrateStore(loaded) {
  const def = createDefaultStore();
  const s = { ...def, ...loaded };
  const resolvedPasscode =
    loaded?.security?.passcode || process.env.LOVE_PASSCODE || def.security.passcode;
  s.security = {
    passcode: resolvedPasscode,
    isDefaultPasscode:
      loaded?.security?.isDefaultPasscode !== undefined
        ? loaded.security.isDefaultPasscode
        : resolvedPasscode === '5201314',
    secret: loaded?.security?.secret || def.security.secret,
  };
  s.couple = { ...def.couple, ...(loaded?.couple || {}) };
  s.partners = {
    him: { ...def.partners.him, ...(loaded?.partners?.him || {}) },
    her: { ...def.partners.her, ...(loaded?.partners?.her || {}) },
  };
  s.cities = (loaded?.cities || def.cities).map((c) => {
    const photos = Array.isArray(c.photos)
      ? c.photos
      : c.photo
      ? [c.photo]
      : [];
    return {
      ...c,
      photos,
      photo: photos[0] || c.photo || '',
    };
  });
  if (!s.questionState || !s.questionState.current) {
    s.questionState = def.questionState;
  }
  if (!Array.isArray(s.wishlist)) {
    s.wishlist = def.wishlist;
  }
  s.emotionControl = {
    ...def.emotionControl,
    ...(loaded?.emotionControl || {}),
    peaceNotes: {
      ...def.emotionControl.peaceNotes,
      ...(loaded?.emotionControl?.peaceNotes || {}),
    },
    recentSoothes: Array.isArray(loaded?.emotionControl?.recentSoothes)
      ? loaded.emotionControl.recentSoothes
      : [],
  };
  return s;
}

let store = null;

async function saveStore() {
  if (!store) return;
  await persistStoreData({ store, storePath: STORE_PATH, dataDir: DATA_DIR });
}

async function getStore() {
  if (isCloudStorageEnabled() || !store) {
    store = await loadPersistedStore({
      storePath: STORE_PATH,
      dataDir: DATA_DIR,
      createDefaultStore,
      migrateStore,
    });
  }
  const today = getTodayStr();
  if (store.todayDate !== today) {
    store.todayDate = today;
    store.partners.him.missCountToday = 0;
    store.partners.her.missCountToday = 0;
    await saveStore();
  }
  return store;
}

function sanitizeState() {
  const { security, ...rest } = store;
  return {
    ...rest,
    securityInfo: {
      isDefaultPasscode: Boolean(security?.isDefaultPasscode),
    },
    storageMode: isCloudStorageEnabled() ? 'cloud' : 'local',
  };
}

function makeAuthToken() {
  return crypto
    .createHmac('sha256', store.security.secret)
    .update(store.security.passcode)
    .digest('hex');
}

function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false;
  const expected = makeAuthToken();
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

function extractToken(req) {
  const headerToken = req.headers['x-love-token'];
  if (typeof headerToken === 'string' && headerToken) return headerToken;
  if (typeof req.query.token === 'string' && req.query.token) return req.query.token;
  return '';
}

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const requireAuth = ah(async (req, res, next) => {
  await getStore();
  if (!isTokenValid(extractToken(req))) {
    return res.status(401).json({ error: '需要输入专属空间口令才能进入哦' });
  }
  next();
});

function addRecentEvent(by, emoji, text) {
  store.recentEvents = [
    {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      by,
      emoji,
      text,
      createdAt: Date.now(),
    },
    ...(store.recentEvents || []),
  ].slice(0, 24);
}

const sseClients = new Set();

function getOnlineRoles() {
  const roles = { him: false, her: false };
  for (const client of sseClients) {
    if (client.role === 'him') roles.him = true;
    if (client.role === 'her') roles.her = true;
  }
  return roles;
}

function broadcast(eventName, payload) {
  if (sseClients.size === 0) return;
  const safePayload = {
    ...payload,
    state: payload.state ? sanitizeState() : undefined,
    online: getOnlineRoles(),
  };
  const data = JSON.stringify(safePayload);
  for (const client of sseClients) {
    try {
      client.res.write(`event: ${eventName}\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

const pendingPulsePush = new Map();

async function dispatchExternalPush(targetRole, title, body) {
  const target = store?.partners?.[targetRole];
  const rawUrl = target?.pushUrl?.trim();
  if (!rawUrl) return { sent: false, reason: 'no_url' };

  const appUrl = store.couple.appPublicUrl?.trim();
  const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2200) : undefined;

  try {
    if (rawUrl.includes('api.day.app') || /\/[A-Za-z0-9]{16,}\/?$/.test(rawUrl)) {
      const endpoint = rawUrl.replace(/\/+$/, '');
      const payload = {
        title,
        body,
        group: 'LoveSpace',
        sound: 'bell',
        isArchive: 1,
      };
      if (appUrl) payload.url = appUrl;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
      return { sent: true, channel: 'bark' };
    }

    if (rawUrl.includes('pushplus.plus')) {
      const linkHtml = appUrl ? `<p><a href="${appUrl}">点我打开心动小屋</a></p>` : '';
      await fetch(rawUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: `<p>${body}</p>${linkHtml}`,
          template: 'html',
        }),
        signal,
      });
      return { sent: true, channel: 'pushplus' };
    }

    if (
      rawUrl.includes('open.feishu.cn') ||
      rawUrl.includes('qyapi.weixin.qq.com') ||
      rawUrl.includes('oapi.dingtalk.com')
    ) {
      const content = appUrl ? `${title}\n${body}\n打开小屋：${appUrl}` : `${title}\n${body}`;
      const bodyObj = rawUrl.includes('open.feishu.cn')
        ? { msg_type: 'text', content: { text: content } }
        : { msgtype: 'text', text: { content } };
      await fetch(rawUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
        signal,
      });
      return { sent: true, channel: 'bot_webhook' };
    }

    if (rawUrl.includes('ntfy.sh')) {
      await fetch(rawUrl, {
        method: 'POST',
        headers: {
          Title: title,
          ...(appUrl ? { Click: appUrl } : {}),
        },
        body,
        signal,
      });
      return { sent: true, channel: 'ntfy' };
    }

    await fetch(rawUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url: appUrl || undefined, ts: Date.now() }),
      signal,
    });
    return { sent: true, channel: 'webhook' };
  } catch (err) {
    console.warn('External push failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

async function schedulePulsePush(fromRole, actionLabel, comboCount) {
  const targetRole = fromRole === 'him' ? 'her' : 'him';
  const sender = store.partners[fromRole];

  if (process.env.VERCEL) {
    // Serverless cannot rely on delayed timers; push on 1st or every 5th tap
    if (comboCount === 1 || comboCount % 5 === 0) {
      const title = `💗 ${sender.name}`;
      const body =
        comboCount > 1
          ? `刚刚连续对你发了 ${comboCount} 次「${actionLabel}」，快打开看看！`
          : `刚刚对你发了一个「${actionLabel}」`;
      await dispatchExternalPush(targetRole, title, body);
    }
    return;
  }

  const existing = pendingPulsePush.get(targetRole);
  if (existing) {
    clearTimeout(existing.timer);
    existing.count += 1;
    existing.label = actionLabel;
  }
  const entry = existing || { count: 1, label: actionLabel };
  entry.timer = setTimeout(() => {
    pendingPulsePush.delete(targetRole);
    const total = Math.max(entry.count, comboCount || 1);
    const title = `💗 ${sender.name}`;
    const body =
      total > 1
        ? `刚刚连续对你发了 ${total} 次「${entry.label}」，快打开看看！`
        : `刚刚对你发了一个「${entry.label}」`;
    dispatchExternalPush(targetRole, title, body);
  }, 1800);
  pendingPulsePush.set(targetRole, entry);
}

const app = express();
app.use(express.json({ limit: '16mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    storage: isCloudStorageEnabled() ? 'supabase' : 'local',
    ts: Date.now(),
  });
});

// Public auth gate metadata
app.get(
  '/api/auth/status',
  ah(async (req, res) => {
    await getStore();
    const token = extractToken(req);
    const authorized = isTokenValid(token);
    res.json({
      authorized,
      title: store.couple.title,
      loveQuote: store.couple.loveQuote,
      isDefaultPasscode: Boolean(store.security?.isDefaultPasscode),
      partners: {
        him: { name: store.partners.him.name, avatarEmoji: store.partners.him.avatarEmoji },
        her: { name: store.partners.her.name, avatarEmoji: store.partners.her.avatarEmoji },
      },
    });
  })
);

app.post(
  '/api/auth/unlock',
  ah(async (req, res) => {
    await getStore();
    const code = String(req.body?.passcode || '').trim();
    if (!code || code !== store.security.passcode) {
      return res.status(403).json({ error: '暗号不对哦，再想想你们的专属口令~' });
    }
    res.json({
      token: makeAuthToken(),
      state: sanitizeState(),
      online: getOnlineRoles(),
    });
  })
);

// Change passcode (authenticated)
app.post(
  '/api/auth/passcode',
  requireAuth,
  ah(async (req, res) => {
    const nextCode = String(req.body?.passcode || '').trim();
    if (nextCode.length < 4 || nextCode.length > 24) {
      return res.status(400).json({ error: '新口令长度需要在 4 到 24 个字符之间' });
    }
    store.security.passcode = nextCode;
    store.security.isDefaultPasscode = false;
    await saveStore();
    res.json({
      ok: true,
      token: makeAuthToken(),
      state: sanitizeState(),
    });
  })
);

// SSE stream (used in local/VPS mode)
app.get('/api/events', requireAuth, (req, res) => {
  const role = req.query.role === 'her' ? 'her' : req.query.role === 'him' ? 'him' : 'guest';
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { res, role, lastSeen: Date.now() };
  sseClients.add(client);

  res.write(
    `event: init\ndata: ${JSON.stringify({ state: sanitizeState(), online: getOnlineRoles() })}\n\n`
  );
  broadcast('presence', { online: getOnlineRoles() });

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
    broadcast('presence', { online: getOnlineRoles() });
  });
});

app.get(
  '/api/state',
  requireAuth,
  ah(async (_req, res) => {
    res.json({ state: sanitizeState(), online: getOnlineRoles() });
  })
);

app.post(
  '/api/pulse',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const action = req.body.action || { key: 'miss', emoji: '💗', label: '想你了' };
    const combo = Number(req.body.combo || 1);

    const now = Date.now();
    store.partners[from].missCountToday += 1;
    store.partners[from].lastPulseAt = now;

    let telepathy = false;
    const partnerLast = store.partners[target].lastPulseAt || 0;
    if (partnerLast && now - partnerLast <= 12000 && now - (store.lastTelepathyAt || 0) > 15000) {
      telepathy = true;
      store.telepathyCount = (store.telepathyCount || 0) + 1;
      store.lastTelepathyAt = now;
      addRecentEvent(from, '✨', '触发了「心有灵犀」，同一刻在想念彼此');
    } else if (combo === 1 || combo % 10 === 0) {
      addRecentEvent(
        from,
        action.emoji || '💗',
        combo > 1 ? `连续发射了 ${combo} 次「${action.label}」` : `向你发送了「${action.label}」`
      );
    }

    await saveStore();

    const eventPayload = {
      from,
      target,
      action,
      combo,
      telepathy,
      telepathyCount: store.telepathyCount,
      state: sanitizeState(),
      ts: now,
    };

    broadcast('pulse', eventPayload);
    await schedulePulsePush(from, action.label || '想你了', combo);

    if (telepathy) {
      await dispatchExternalPush(target, '✨ 心有灵犀！', '你们竟然在同一刻想起了彼此，快打开看看！');
    }

    res.json(eventPayload);
  })
);

app.post(
  '/api/mood',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const mood = String(req.body.mood || 'miss');
    const moodLabel = String(req.body.moodLabel || '想你');
    const moodEmoji = String(req.body.moodEmoji || '💗');

    store.partners[from].mood = mood;
    store.partners[from].moodUpdatedAt = Date.now();
    addRecentEvent(from, moodEmoji, `切换了此刻状态：${moodLabel}`);
    await saveStore();

    const payload = {
      from,
      target,
      mood,
      moodLabel,
      moodEmoji,
      state: sanitizeState(),
      ts: Date.now(),
    };
    broadcast('mood', payload);
    await dispatchExternalPush(
      target,
      `${moodEmoji} ${store.partners[from].name}`,
      `TA 把状态换成了「${moodLabel}」${mood === 'hug' ? '，快去抱抱 TA 吧！' : ''}`
    );
    res.json(payload);
  })
);

app.post(
  '/api/polaroid',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const imageData = String(req.body.imageData || '');
    const caption = String(req.body.caption || '').slice(0, 40);
    const cityTag = String(req.body.cityTag || store.partners[from].city || '此刻').slice(0, 16);

    if (!imageData) {
      return res.status(400).json({ error: '请先选择一张照片呀' });
    }

    if (store.polaroid?.imageData) {
      store.polaroidHistory = [store.polaroid, ...(store.polaroidHistory || [])].slice(0, 30);
    }

    const now = Date.now();
    store.polaroid = {
      id: `pol-${now}`,
      author: from,
      imageData,
      caption: caption || '拍下这一刻寄给你',
      cityTag,
      createdAt: now,
      stamps: [],
    };
    addRecentEvent(from, '📸', `寄来一张新拍立得「${store.polaroid.caption}」`);
    await saveStore();

    const payload = { from, target, polaroid: store.polaroid, state: sanitizeState(), ts: now };
    broadcast('polaroid', payload);
    await dispatchExternalPush(
      target,
      `📸 ${store.partners[from].name} 寄来一张拍立得`,
      store.polaroid.caption
    );
    res.json(payload);
  })
);

app.post(
  '/api/polaroid/stamp',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const polaroidId = req.body.polaroidId ? String(req.body.polaroidId) : store.polaroid.id;
    const label = String(req.body.label || '可爱满分').slice(0, 12);
    const emoji = String(req.body.emoji || '♡');
    const now = Date.now();

    const stamp = {
      id: `st-${now}-${Math.random().toString(36).slice(2, 5)}`,
      by: from,
      label,
      emoji,
      x: Math.round(18 + Math.random() * 62),
      y: Math.round(20 + Math.random() * 58),
      rotate: Math.round(-16 + Math.random() * 32),
      createdAt: now,
    };

    if (polaroidId === store.polaroid.id) {
      store.polaroid.stamps = [...(store.polaroid.stamps || []), stamp].slice(-10);
    } else {
      const idx = (store.polaroidHistory || []).findIndex((p) => p.id === polaroidId);
      if (idx >= 0) {
        store.polaroidHistory[idx].stamps = [
          ...(store.polaroidHistory[idx].stamps || []),
          stamp,
        ].slice(-10);
      }
    }

    addRecentEvent(from, emoji, `在拍立得上盖了一个「${label}」印章`);
    await saveStore();

    const payload = { from, target, polaroidId, stamp, state: sanitizeState(), ts: now };
    broadcast('stamp', payload);
    await dispatchExternalPush(
      target,
      `${emoji} ${store.partners[from].name} 盖了个印章`,
      `TA 在拍立得上啪地盖上了「${label}」`
    );
    res.json(payload);
  })
);

app.delete(
  '/api/polaroid/:id',
  requireAuth,
  ah(async (req, res) => {
    const id = req.params.id;
    if (store.polaroid?.id === id) {
      const nextLatest = (store.polaroidHistory || [])[0];
      if (nextLatest) {
        store.polaroid = nextLatest;
        store.polaroidHistory = store.polaroidHistory.slice(1);
      } else {
        store.polaroid = {
          ...store.polaroid,
          imageData: '',
          caption: '想把每一个此刻，都拍下来寄给你',
          stamps: [],
        };
      }
    } else {
      store.polaroidHistory = (store.polaroidHistory || []).filter((p) => p.id !== id);
    }
    await saveStore();
    const payload = { state: sanitizeState(), ts: Date.now() };
    broadcast('polaroid_delete', payload);
    res.json(payload);
  })
);

// Cities & multi-photo album
app.post(
  '/api/city',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const cityId = String(req.body.id || '');
    const idx = (store.cities || []).findIndex((c) => c.id === cityId);

    if (cityId === 'next') {
      store.nextCity = {
        name: String(req.body.name || store.nextCity.name).slice(0, 24),
        note: String(req.body.note || store.nextCity.note).slice(0, 140),
      };
      addRecentEvent(from, '✦', `更新了你们的下一站约定「${store.nextCity.name}」`);
    } else if (idx >= 0) {
      const prev = store.cities[idx];
      const nextPhotos = Array.isArray(req.body.photos)
        ? req.body.photos.filter(Boolean).slice(0, 8)
        : prev.photos || [];
      store.cities[idx] = {
        ...prev,
        tagline:
          req.body.tagline !== undefined ? String(req.body.tagline).slice(0, 80) : prev.tagline,
        memory: req.body.memory !== undefined ? String(req.body.memory).slice(0, 300) : prev.memory,
        dateLabel:
          req.body.dateLabel !== undefined
            ? String(req.body.dateLabel).slice(0, 20)
            : prev.dateLabel,
        photos: nextPhotos,
        photo: nextPhotos[0] || '',
      };
      addRecentEvent(from, '📍', `更新了「${prev.name}」的旅行记忆`);
    } else {
      return res.status(404).json({ error: '未找到对应城市' });
    }

    await saveStore();
    const payload = { from, cityId, state: sanitizeState(), ts: Date.now() };
    broadcast('city', payload);
    res.json(payload);
  })
);

// Coupons
app.post(
  '/api/coupon',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const couponId = String(req.body.couponId || '');
    const actionType = req.body.type === 'accept' ? 'accept' : 'send';

    const idx = (store.coupons || []).findIndex((c) => c.id === couponId);
    if (idx < 0) return res.status(404).json({ error: '未找到该特权券' });

    const coupon = store.coupons[idx];
    const now = Date.now();

    if (actionType === 'send') {
      coupon.activeRequest = {
        from,
        to: target,
        sentAt: now,
        acceptedAt: null,
      };
      addRecentEvent(from, coupon.emoji, `递出了一张「${coupon.title}」`);
      await dispatchExternalPush(
        target,
        `${coupon.emoji} ${store.partners[from].name} 递来一张券`,
        `TA 使用了「${coupon.title}」，快点开签收！`
      );
    } else {
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      coupon.activeRequest = {
        ...(coupon.activeRequest || { from: target, to: from, sentAt: now }),
        acceptedAt: now,
        acceptedBy: from,
      };
      addRecentEvent(from, '💮', `签收了「${coupon.title}」`);
      await dispatchExternalPush(
        target,
        `💮 ${store.partners[from].name} 签收啦！`,
        `TA 已经开心地盖章签收了「${coupon.title}」`
      );
    }

    await saveStore();
    const payload = { from, target, actionType, coupon, state: sanitizeState(), ts: now };
    broadcast('coupon', payload);
    res.json(payload);
  })
);

// Daily Question
app.post(
  '/api/question/answer',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const answer = String(req.body.answer || '').trim().slice(0, 260);
    if (!answer) return res.status(400).json({ error: '写几句再提交呀~' });

    const q = store.questionState.current;
    q.answers[from] = answer;
    q.updatedAt = Date.now();

    const bothAnswered = Boolean(q.answers.him && q.answers.her);
    addRecentEvent(
      from,
      '💬',
      bothAnswered ? '回答了今日一问，双方答案已解锁！' : '写好了今日一问的答案，等你作答解锁'
    );
    await saveStore();

    const payload = { from, target, bothAnswered, state: sanitizeState(), ts: Date.now() };
    broadcast('question', payload);
    await dispatchExternalPush(
      target,
      bothAnswered ? '✨ 今日一问答案已双人解锁' : `💌 ${store.partners[from].name} 答完今日一问了`,
      bothAnswered ? '你们都回答好了，快去看 TA 写了什么！' : 'TA 已留下心里话，等你回答后就能同时解锁'
    );
    res.json(payload);
  })
);

app.post(
  '/api/question/next',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const cur = store.questionState.current;
    if (cur?.answers?.him || cur?.answers?.her) {
      store.questionState.history = [
        { ...cur, archivedAt: Date.now() },
        ...(store.questionState.history || []),
      ].slice(0, 30);
    }

    const nextIdx = ((store.questionState.index || 0) + 1) % QUESTION_BANK.length;
    store.questionState.index = nextIdx;
    store.questionState.current = {
      id: `q-${Date.now()}`,
      prompt: QUESTION_BANK[nextIdx],
      answers: { him: '', her: '' },
      updatedAt: Date.now(),
    };
    addRecentEvent(from, '🎲', '换了一道新的每日一问');
    await saveStore();

    const payload = { from, state: sanitizeState(), ts: Date.now() };
    broadcast('question', payload);
    res.json(payload);
  })
);

app.post(
  '/api/question/custom',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const prompt = String(req.body.prompt || '').trim().slice(0, 120);
    if (!prompt) return res.status(400).json({ error: '请先写下想问 TA 的问题~' });

    const cur = store.questionState.current;
    if (cur?.answers?.him || cur?.answers?.her) {
      store.questionState.history = [
        { ...cur, archivedAt: Date.now() },
        ...(store.questionState.history || []),
      ].slice(0, 30);
    }

    store.questionState.current = {
      id: `q-${Date.now()}`,
      prompt,
      by: from,
      answers: { him: '', her: '' },
      updatedAt: Date.now(),
    };
    addRecentEvent(from, '❓', `出了一道专属问题：「${prompt}」`);
    await saveStore();

    const payload = { from, state: sanitizeState(), ts: Date.now() };
    broadcast('question', payload);
    res.json(payload);
  })
);

// Wishlist
app.post(
  '/api/wishlist',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const text = String(req.body.text || '').trim().slice(0, 80);
    const cityTag = String(req.body.cityTag || '约定').trim().slice(0, 14);
    if (!text) return res.status(400).json({ error: '写下想一起做的事吧' });

    const item = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      text,
      cityTag: cityTag || '约定',
      done: false,
      by: from,
      createdAt: Date.now(),
    };
    store.wishlist = [item, ...(store.wishlist || [])].slice(0, 50);
    addRecentEvent(from, '📝', `在见面清单里添加了「${text}」`);
    await saveStore();

    const payload = { from, item, state: sanitizeState(), ts: Date.now() };
    broadcast('wishlist', payload);
    res.json(payload);
  })
);

app.post(
  '/api/wishlist/toggle',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const id = String(req.body.id || '');
    const idx = (store.wishlist || []).findIndex((w) => w.id === id);
    if (idx < 0) return res.status(404).json({ error: '未找到愿望条目' });

    store.wishlist[idx].done = !store.wishlist[idx].done;
    store.wishlist[idx].doneAt = store.wishlist[idx].done ? Date.now() : null;
    if (store.wishlist[idx].done) {
      addRecentEvent(from, '🎉', `一起实现了愿望「${store.wishlist[idx].text}」`);
    }
    await saveStore();

    const payload = { from, state: sanitizeState(), ts: Date.now() };
    broadcast('wishlist', payload);
    res.json(payload);
  })
);

app.delete(
  '/api/wishlist/:id',
  requireAuth,
  ah(async (req, res) => {
    store.wishlist = (store.wishlist || []).filter((w) => w.id !== req.params.id);
    await saveStore();
    const payload = { state: sanitizeState(), ts: Date.now() };
    broadcast('wishlist', payload);
    res.json(payload);
  })
);

// Emotion Control & Conflict Cooling
app.post(
  '/api/emotion/anger',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const level = Math.max(0, Math.min(100, Number(req.body.level || 0)));

    store.partners[from].angerLevel = level;
    if (level === 0) {
      store.emotionControl.peaceProposalBy = '';
      if (store.partners[target].angerLevel === 0) {
        store.emotionControl.recentSoothes = [];
      }
      addRecentEvent(from, '☀️', '情绪回到平静晴天啦');
    } else {
      const desc =
        level >= 90 ? '火山预警·需要先冷静一下' : level >= 65 ? '气鼓鼓中，需要哄一哄' : '有点小委屈';
      addRecentEvent(from, '🌧️', `调整了情绪温度（${level}% · ${desc}）`);
      await dispatchExternalPush(
        target,
        `🌧️ ${store.partners[from].name} 情绪温度 ${level}%`,
        `${desc}，先别讲道理，打开小屋哄哄 TA 吧`
      );
    }

    await saveStore();
    const payload = { from, target, level, state: sanitizeState(), ts: Date.now() };
    broadcast('emotion', payload);
    res.json(payload);
  })
);

app.post(
  '/api/emotion/soothe',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const label = String(req.body.label || '诚恳认错，先抱抱').slice(0, 32);
    const now = Date.now();

    store.partners[target].sootheCount = (store.partners[target].sootheCount || 0) + 1;
    store.emotionControl.recentSoothes = [
      {
        id: `sth-${now}-${Math.random().toString(36).slice(2, 5)}`,
        from,
        label,
        createdAt: now,
      },
      ...(store.emotionControl.recentSoothes || []),
    ].slice(0, 8);

    addRecentEvent(from, '🧯', `正在认真哄 ${store.partners[target].name}：「${label}」`);
    await saveStore();

    const payload = { from, target, label, state: sanitizeState(), ts: now };
    broadcast('soothe', payload);
    await dispatchExternalPush(target, `🧯 ${store.partners[from].name} 来哄你啦`, label);
    res.json(payload);
  })
);

app.post(
  '/api/emotion/cooldown',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const active = Boolean(req.body.active);
    const minutes = Math.max(5, Math.min(30, Number(req.body.minutes || 15)));
    const now = Date.now();

    if (active) {
      store.emotionControl.cooldownUntil = now + minutes * 60 * 1000;
      store.emotionControl.cooldownBy = from;
      addRecentEvent(from, '⏸️', `开启了 ${minutes} 分钟冷静呼吸保护，冷静下来就回来抱你`);
      await dispatchExternalPush(
        target,
        `⏸️ ${store.partners[from].name} 开启了冷静呼吸`,
        `TA 怕气头上说伤人的话，约好冷静 ${minutes} 分钟后再好好聊`
      );
    } else {
      store.emotionControl.cooldownUntil = 0;
      store.emotionControl.cooldownBy = '';
      addRecentEvent(from, '🌿', '结束了冷静呼吸，想和 TA 好好聊一聊');
      await dispatchExternalPush(
        target,
        `🌿 ${store.partners[from].name} 冷静下来啦`,
        'TA 准备好了，回来抱抱和好吧'
      );
    }

    await saveStore();
    const payload = { from, target, active, state: sanitizeState(), ts: now };
    broadcast('emotion', payload);
    res.json(payload);
  })
);

app.post(
  '/api/emotion/peace',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const target = from === 'him' ? 'her' : 'him';
    const type = req.body.type === 'accept' ? 'accept' : 'propose';
    const now = Date.now();

    if (type === 'propose') {
      store.emotionControl.peaceProposalBy = from;
      addRecentEvent(from, '🏳️', '举起白旗求和：别吵啦，好想抱你');
      await saveStore();
      const payload = { from, target, type, state: sanitizeState(), ts: now };
      broadcast('emotion', payload);
      await dispatchExternalPush(
        target,
        `🏳️ ${store.partners[from].name} 举白旗求和啦`,
        '点开小屋「和好」，一起雨过天晴吧！'
      );
      return res.json(payload);
    }

    store.partners.him.angerLevel = 0;
    store.partners.her.angerLevel = 0;
    store.emotionControl.cooldownUntil = 0;
    store.emotionControl.cooldownBy = '';
    store.emotionControl.peaceProposalBy = '';
    store.emotionControl.recentSoothes = [];
    addRecentEvent(from, '🌈', '接受了和好！雨过天晴，下不为例');
    await saveStore();

    const payload = { from, target, type: 'accept', state: sanitizeState(), ts: now };
    broadcast('peace_resolved', payload);
    await dispatchExternalPush(
      target,
      '🌈 雨过天晴！你们和好啦',
      `${store.partners[from].name} 接受了和好，快发个抱抱吧！`
    );
    res.json(payload);
  })
);

app.post(
  '/api/emotion/note',
  requireAuth,
  ah(async (req, res) => {
    const from = req.body.from === 'her' ? 'her' : 'him';
    const note = String(req.body.note || '').trim().slice(0, 140);
    store.emotionControl.peaceNotes[from] = note;
    await saveStore();
    const payload = { from, state: sanitizeState(), ts: Date.now() };
    broadcast('emotion', payload);
    res.json(payload);
  })
);

// Settings
app.post(
  '/api/settings',
  requireAuth,
  ah(async (req, res) => {
    const { couple, him, her } = req.body || {};

    if (couple) {
      store.couple = {
        ...store.couple,
        title: couple.title !== undefined ? String(couple.title).slice(0, 24) : store.couple.title,
        anniversaryDate:
          couple.anniversaryDate !== undefined ? couple.anniversaryDate : store.couple.anniversaryDate,
        reunionDate:
          couple.reunionDate !== undefined ? couple.reunionDate : store.couple.reunionDate,
        loveQuote:
          couple.loveQuote !== undefined
            ? String(couple.loveQuote).slice(0, 50)
            : store.couple.loveQuote,
        distanceKm:
          couple.distanceKm !== undefined ? Number(couple.distanceKm) || 0 : store.couple.distanceKm,
        appPublicUrl:
          couple.appPublicUrl !== undefined
            ? String(couple.appPublicUrl).trim()
            : store.couple.appPublicUrl,
      };
    }
    if (him) {
      store.partners.him = {
        ...store.partners.him,
        name: him.name !== undefined ? String(him.name).slice(0, 16) : store.partners.him.name,
        city: him.city !== undefined ? String(him.city).slice(0, 12) : store.partners.him.city,
        avatarEmoji: him.avatarEmoji || store.partners.him.avatarEmoji,
        pushUrl: him.pushUrl !== undefined ? String(him.pushUrl).trim() : store.partners.him.pushUrl,
      };
    }
    if (her) {
      store.partners.her = {
        ...store.partners.her,
        name: her.name !== undefined ? String(her.name).slice(0, 16) : store.partners.her.name,
        city: her.city !== undefined ? String(her.city).slice(0, 12) : store.partners.her.city,
        avatarEmoji: her.avatarEmoji || store.partners.her.avatarEmoji,
        pushUrl: her.pushUrl !== undefined ? String(her.pushUrl).trim() : store.partners.her.pushUrl,
      };
    }

    await saveStore();
    const payload = { state: sanitizeState(), ts: Date.now() };
    broadcast('settings', payload);
    res.json(payload);
  })
);

app.post(
  '/api/push/test',
  requireAuth,
  ah(async (req, res) => {
    const targetRole = req.body.target === 'her' ? 'her' : 'him';
    const result = await dispatchExternalPush(
      targetRole,
      '💌 心动小屋测试成功',
      '以后每次 TA 想你、求抱抱或发拍立得，这里都会第一时间通知你！'
    );
    res.json(result);
  })
);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || '服务器开小差了' });
});

if (!process.env.VERCEL && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

function getLocalLanIps() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalLanIps();
    console.log(`\n💗 心动小屋后端服务已启动: http://localhost:${PORT}`);
    if (ips.length > 0) {
      console.log(`📱 同一 Wi-Fi 局域网访问: http://${ips[0]}:${PORT}`);
    }
  });
}

export default app;
