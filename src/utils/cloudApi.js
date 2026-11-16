import { getRealtimeClient } from './realtime';

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

function createInitialClientState() {
  const now = Date.now();
  return {
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

function addEvent(store, by, emoji, text) {
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

async function sendDirectPush(store, targetRole, title, body) {
  const rawUrl = store?.partners?.[targetRole]?.pushUrl?.trim();
  if (!rawUrl) return { sent: false, reason: 'no_url' };
  const appUrl = store?.couple?.appPublicUrl?.trim() || window.location.origin + window.location.pathname;

  try {
    if (rawUrl.includes('api.day.app') || /\/[A-Za-z0-9]{16,}\/?$/.test(rawUrl)) {
      const endpoint = rawUrl.replace(/\/+$/, '');
      const u = `${endpoint}/${encodeURIComponent(title)}/${encodeURIComponent(body)}?group=LoveSpace&sound=bell&url=${encodeURIComponent(appUrl)}`;
      await fetch(u, { mode: 'no-cors' });
      return { sent: true, channel: 'bark' };
    }
    await fetch(rawUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ title, body, url: appUrl }),
    });
    return { sent: true, channel: 'webhook' };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

async function rpc(fnName, args) {
  const sb = getRealtimeClient();
  const { data, error } = await sb.rpc(fnName, args);
  if (error) {
    const msg = error.message || '';
    if (msg.includes('INVALID_PASSCODE_LENGTH')) {
      throw new Error('新口令长度需要在 4 到 24 个字符之间');
    }
    if (msg.includes('INVALID_PASSCODE')) {
      const err = new Error('暗号不对哦，再想想你们的专属口令~');
      err.status = 403;
      throw err;
    }
    if (msg.includes('UNAUTHORIZED')) {
      const err = new Error('需要输入专属空间口令才能进入哦');
      err.status = 401;
      throw err;
    }
    throw new Error(msg || '云端同步失败');
  }
  return data;
}

function ensureDailyReset(store) {
  const today = getTodayStr();
  if (store.todayDate !== today) {
    store.todayDate = today;
    store.partners.him.missCountToday = 0;
    store.partners.her.missCountToday = 0;
    return true;
  }
  return false;
}

export async function handleDirectSupabaseApi(url, options, token) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  if (url === '/api/auth/status') {
    return rpc('love_auth_status', { p_token: token || '' });
  }

  if (url === '/api/auth/unlock' && method === 'POST') {
    const res = await rpc('love_unlock', {
      p_passcode: String(body.passcode || ''),
      p_default_state: createInitialClientState(),
    });
    return { token: res.token, state: res.state, online: { him: false, her: false } };
  }

  if (url === '/api/auth/passcode' && method === 'POST') {
    return rpc('love_change_passcode', {
      p_token: token,
      p_new_passcode: String(body.passcode || ''),
    });
  }

  // All remaining routes require loading state first
  const loaded = await rpc('love_get_state', { p_token: token });
  const store = loaded.state;
  const resetChanged = ensureDailyReset(store);

  if (url === '/api/state' && method === 'GET') {
    if (resetChanged) {
      const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
      return { state: saved.state };
    }
    return { state: store };
  }

  const from = body.from === 'her' ? 'her' : 'him';
  const target = from === 'him' ? 'her' : 'him';

  if (url === '/api/pulse') {
    const action = body.action || { key: 'miss', emoji: '💗', label: '想你了' };
    const combo = Number(body.combo || 1);
    const now = Date.now();
    store.partners[from].missCountToday += 1;
    store.partners[from].lastPulseAt = now;

    let telepathy = false;
    const partnerLast = store.partners[target].lastPulseAt || 0;
    if (partnerLast && now - partnerLast <= 12000 && now - (store.lastTelepathyAt || 0) > 15000) {
      telepathy = true;
      store.telepathyCount = (store.telepathyCount || 0) + 1;
      store.lastTelepathyAt = now;
      addEvent(store, from, '✨', '触发了「心有灵犀」，同一刻在想念彼此');
    } else if (combo === 1 || combo % 10 === 0) {
      addEvent(
        store,
        from,
        action.emoji || '💗',
        combo > 1 ? `连续发射了 ${combo} 次「${action.label}」` : `向你发送了「${action.label}」`
      );
    }

    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    if (combo === 1 || combo % 5 === 0) {
      sendDirectPush(
        saved.state,
        target,
        `💗 ${saved.state.partners[from].name}`,
        combo > 1 ? `连续对你发了 ${combo} 次「${action.label}」` : `对你发了一个「${action.label}」`
      );
    }
    return { telepathy, state: saved.state };
  }

  if (url === '/api/mood') {
    store.partners[from].mood = String(body.mood || 'miss');
    store.partners[from].moodUpdatedAt = Date.now();
    addEvent(store, from, body.moodEmoji || '💗', `切换了此刻状态：${body.moodLabel || '想你'}`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    sendDirectPush(saved.state, target, `${body.moodEmoji || '💗'} ${saved.state.partners[from].name}`, `状态换成「${body.moodLabel}」`);
    return { state: saved.state };
  }

  if (url === '/api/polaroid') {
    if (store.polaroid?.imageData) {
      store.polaroidHistory = [store.polaroid, ...(store.polaroidHistory || [])].slice(0, 30);
    }
    const now = Date.now();
    store.polaroid = {
      id: `pol-${now}`,
      author: from,
      imageData: String(body.imageData || ''),
      caption: String(body.caption || '拍下这一刻寄给你').slice(0, 40),
      cityTag: String(body.cityTag || '此刻').slice(0, 16),
      createdAt: now,
      stamps: [],
    };
    addEvent(store, from, '📸', `寄来一张新拍立得「${store.polaroid.caption}」`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    sendDirectPush(saved.state, target, `📸 ${saved.state.partners[from].name} 寄来拍立得`, store.polaroid.caption);
    return { state: saved.state };
  }

  if (url === '/api/polaroid/stamp') {
    const polaroidId = body.polaroidId ? String(body.polaroidId) : store.polaroid.id;
    const now = Date.now();
    const stamp = {
      id: `st-${now}-${Math.random().toString(36).slice(2, 5)}`,
      by: from,
      label: String(body.label || '可爱满分').slice(0, 12),
      emoji: String(body.emoji || '♡'),
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
        store.polaroidHistory[idx].stamps = [...(store.polaroidHistory[idx].stamps || []), stamp].slice(-10);
      }
    }
    addEvent(store, from, stamp.emoji, `在拍立得上盖了一个「${stamp.label}」印章`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url.startsWith('/api/polaroid/') && method === 'DELETE') {
    const id = decodeURIComponent(url.slice('/api/polaroid/'.length));
    if (store.polaroid?.id === id) {
      const nextLatest = (store.polaroidHistory || [])[0];
      if (nextLatest) {
        store.polaroid = nextLatest;
        store.polaroidHistory = store.polaroidHistory.slice(1);
      } else {
        store.polaroid = { ...store.polaroid, imageData: '', caption: '想把每一个此刻，都拍下来寄给你', stamps: [] };
      }
    } else {
      store.polaroidHistory = (store.polaroidHistory || []).filter((p) => p.id !== id);
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/city') {
    const cityId = String(body.id || '');
    if (cityId === 'next') {
      store.nextCity = {
        name: String(body.name || store.nextCity.name).slice(0, 24),
        note: String(body.note || store.nextCity.note).slice(0, 140),
      };
      addEvent(store, from, '✦', `更新了你们的下一站约定「${store.nextCity.name}」`);
    } else {
      const idx = (store.cities || []).findIndex((c) => c.id === cityId);
      if (idx >= 0) {
        const prev = store.cities[idx];
        const nextPhotos = Array.isArray(body.photos) ? body.photos.filter(Boolean).slice(0, 8) : prev.photos || [];
        store.cities[idx] = {
          ...prev,
          tagline: body.tagline !== undefined ? String(body.tagline).slice(0, 80) : prev.tagline,
          memory: body.memory !== undefined ? String(body.memory).slice(0, 300) : prev.memory,
          dateLabel: body.dateLabel !== undefined ? String(body.dateLabel).slice(0, 20) : prev.dateLabel,
          photos: nextPhotos,
          photo: nextPhotos[0] || '',
        };
        addEvent(store, from, '📍', `更新了「${prev.name}」的旅行记忆`);
      }
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/coupon') {
    const idx = (store.coupons || []).findIndex((c) => c.id === body.couponId);
    if (idx < 0) throw new Error('未找到该特权券');
    const coupon = store.coupons[idx];
    const now = Date.now();
    if (body.type === 'accept') {
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      coupon.activeRequest = { ...(coupon.activeRequest || { from: target, to: from, sentAt: now }), acceptedAt: now, acceptedBy: from };
      addEvent(store, from, '💮', `签收了「${coupon.title}」`);
      sendDirectPush(store, target, `💮 ${store.partners[from].name} 签收啦`, coupon.title);
    } else {
      coupon.activeRequest = { from, to: target, sentAt: now, acceptedAt: null };
      addEvent(store, from, coupon.emoji, `递出了一张「${coupon.title}」`);
      sendDirectPush(store, target, `${coupon.emoji} ${store.partners[from].name} 递来一张券`, coupon.title);
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { coupon, state: saved.state };
  }

  if (url === '/api/question/answer') {
    const answer = String(body.answer || '').trim().slice(0, 260);
    if (!answer) throw new Error('写几句再提交呀~');
    const q = store.questionState.current;
    q.answers[from] = answer;
    q.updatedAt = Date.now();
    const bothAnswered = Boolean(q.answers.him && q.answers.her);
    addEvent(store, from, '💬', bothAnswered ? '回答了今日一问，双方答案已解锁！' : '写好了今日一问的答案，等你作答解锁');
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { bothAnswered, state: saved.state };
  }

  if (url === '/api/question/next') {
    const cur = store.questionState.current;
    if (cur?.answers?.him || cur?.answers?.her) {
      store.questionState.history = [{ ...cur, archivedAt: Date.now() }, ...(store.questionState.history || [])].slice(0, 30);
    }
    const nextIdx = ((store.questionState.index || 0) + 1) % QUESTION_BANK.length;
    store.questionState.index = nextIdx;
    store.questionState.current = { id: `q-${Date.now()}`, prompt: QUESTION_BANK[nextIdx], answers: { him: '', her: '' }, updatedAt: Date.now() };
    addEvent(store, from, '🎲', '换了一道新的每日一问');
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/question/custom') {
    const prompt = String(body.prompt || '').trim().slice(0, 120);
    if (!prompt) throw new Error('请先写下想问 TA 的问题~');
    const cur = store.questionState.current;
    if (cur?.answers?.him || cur?.answers?.her) {
      store.questionState.history = [{ ...cur, archivedAt: Date.now() }, ...(store.questionState.history || [])].slice(0, 30);
    }
    store.questionState.current = { id: `q-${Date.now()}`, prompt, by: from, answers: { him: '', her: '' }, updatedAt: Date.now() };
    addEvent(store, from, '❓', `出了一道专属问题：「${prompt}」`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/wishlist') {
    const text = String(body.text || '').trim().slice(0, 80);
    if (!text) throw new Error('写下想一起做的事吧');
    store.wishlist = [{ id: `w-${Date.now()}`, text, cityTag: String(body.cityTag || '约定').slice(0, 14), done: false, by: from, createdAt: Date.now() }, ...(store.wishlist || [])].slice(0, 50);
    addEvent(store, from, '📝', `在见面清单里添加了「${text}」`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/wishlist/toggle') {
    const idx = (store.wishlist || []).findIndex((w) => w.id === body.id);
    if (idx >= 0) {
      store.wishlist[idx].done = !store.wishlist[idx].done;
      store.wishlist[idx].doneAt = store.wishlist[idx].done ? Date.now() : null;
      if (store.wishlist[idx].done) addEvent(store, from, '🎉', `一起实现了愿望「${store.wishlist[idx].text}」`);
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url.startsWith('/api/wishlist/') && method === 'DELETE') {
    const id = decodeURIComponent(url.slice('/api/wishlist/'.length));
    store.wishlist = (store.wishlist || []).filter((w) => w.id !== id);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/emotion/anger') {
    const level = Math.max(0, Math.min(100, Number(body.level || 0)));
    store.partners[from].angerLevel = level;
    if (level === 0) {
      store.emotionControl.peaceProposalBy = '';
      if (store.partners[target].angerLevel === 0) store.emotionControl.recentSoothes = [];
      addEvent(store, from, '☀️', '情绪回到平静晴天啦');
    } else {
      addEvent(store, from, '🌧️', `调整了情绪温度（${level}%）`);
      sendDirectPush(store, target, `🌧️ ${store.partners[from].name} 情绪温度 ${level}%`, '先别讲道理，快去小屋哄哄 TA');
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/emotion/soothe') {
    const label = String(body.label || '诚恳认错，先抱抱').slice(0, 32);
    const now = Date.now();
    store.partners[target].sootheCount = (store.partners[target].sootheCount || 0) + 1;
    store.emotionControl.recentSoothes = [{ id: `sth-${now}`, from, label, createdAt: now }, ...(store.emotionControl.recentSoothes || [])].slice(0, 8);
    addEvent(store, from, '🧯', `正在认真哄 ${store.partners[target].name}：「${label}」`);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    sendDirectPush(saved.state, target, `🧯 ${saved.state.partners[from].name} 来哄你啦`, label);
    return { state: saved.state };
  }

  if (url === '/api/emotion/cooldown') {
    const active = Boolean(body.active);
    const minutes = Math.max(5, Math.min(30, Number(body.minutes || 15)));
    if (active) {
      store.emotionControl.cooldownUntil = Date.now() + minutes * 60 * 1000;
      store.emotionControl.cooldownBy = from;
      addEvent(store, from, '⏸️', `开启了 ${minutes} 分钟冷静呼吸保护`);
    } else {
      store.emotionControl.cooldownUntil = 0;
      store.emotionControl.cooldownBy = '';
      addEvent(store, from, '🌿', '结束了冷静呼吸');
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/emotion/peace') {
    if (body.type === 'accept') {
      store.partners.him.angerLevel = 0;
      store.partners.her.angerLevel = 0;
      store.emotionControl.cooldownUntil = 0;
      store.emotionControl.cooldownBy = '';
      store.emotionControl.peaceProposalBy = '';
      store.emotionControl.recentSoothes = [];
      addEvent(store, from, '🌈', '接受了和好！雨过天晴');
      sendDirectPush(store, target, '🌈 雨过天晴！你们和好啦', '快发个抱抱吧！');
    } else {
      store.emotionControl.peaceProposalBy = from;
      addEvent(store, from, '🏳️', '举起白旗求和：别吵啦，好想抱你');
      sendDirectPush(store, target, `🏳️ ${store.partners[from].name} 举白旗求和啦`, '点开小屋和好吧');
    }
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/emotion/note') {
    store.emotionControl.peaceNotes[from] = String(body.note || '').trim().slice(0, 140);
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/settings') {
    const { couple, him, her } = body;
    if (couple) store.couple = { ...store.couple, ...couple };
    if (him) store.partners.him = { ...store.partners.him, ...him };
    if (her) store.partners.her = { ...store.partners.her, ...her };
    const saved = await rpc('love_save_state', { p_token: token, p_next_data: store });
    return { state: saved.state };
  }

  if (url === '/api/push/test') {
    const targetRole = body.target === 'her' ? 'her' : 'him';
    return sendDirectPush(store, targetRole, '💌 心动小屋测试成功', '以后每次互动都会第一时间通知你！');
  }

  return { state: store };
}
