import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Image as ImageIcon,
  MessageCircleHeart,
  Settings,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  Lock,
  Sparkles,
  Camera,
  Send,
} from 'lucide-react';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import LoungePage from './pages/LoungePage';
import SettingsPage from './pages/SettingsPage';
import CityModal from './components/CityModal';
import { HeartMedallion } from './components/CityArtwork';
import { apiFetch, getSavedToken, saveToken } from './utils/api';
import { emitRealtime, isSupabaseRealtimeEnabled, subscribeRealtime } from './utils/realtime';
import { compressImageFile } from './utils/image';
import { PULSE_ACTIONS } from './utils/constants';
import {
  playPulseSound,
  playReceivePing,
  playStampSound,
  playTelepathySound,
  triggerHaptic,
} from './utils/sound';

const NAV_TABS = [
  { id: 'home', label: '心动', fullLabel: '心动主页', icon: Heart },
  { id: 'gallery', label: '相册', fullLabel: '时光相册', icon: ImageIcon },
  { id: 'lounge', label: '互动', fullLabel: '互动小馆', icon: MessageCircleHeart },
  { id: 'settings', label: '设置', fullLabel: '空间设置', icon: Settings },
];

export default function App() {
  const [authMeta, setAuthMeta] = useState(null);
  const [token, setToken] = useState(() => getSavedToken());
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const [state, setState] = useState(null);
  const [online, setOnline] = useState({ him: false, her: false });
  const [myRole, setMyRole] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('love_space_role') || '';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAction, setSelectedAction] = useState(PULSE_ACTIONS[0]);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState([]);
  const [incomingFlash, setIncomingFlash] = useState(false);
  const [incomingBanner, setIncomingBanner] = useState(null);
  const [telepathyBanner, setTelepathyBanner] = useState(false);
  const [peaceBanner, setPeaceBanner] = useState(false);

  const [editingCity, setEditingCity] = useState(null);
  const [editingNext, setEditingNext] = useState(false);

  const [polaroidDraft, setPolaroidDraft] = useState(null);
  const [captionInput, setCaptionInput] = useState('');
  const [uploadingPolaroid, setUploadingPolaroid] = useState(false);
  const [showGlobalPolaroidModal, setShowGlobalPolaroidModal] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const comboTimerRef = useRef(null);
  const bannerTimerRef = useRef(null);
  const myRoleRef = useRef(myRole);
  const soundEnabledRef = useRef(soundEnabled);
  const stateRef = useRef(state);

  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }, []);

  // Check initial auth status
  useEffect(() => {
    apiFetch('/api/auth/status')
      .then((meta) => {
        setAuthMeta(meta);
        if (!meta.authorized && token) {
          saveToken('');
          setToken('');
        }
      })
      .catch(() => {});
  }, [token]);

  function spawnParticles(count = 7, isBurst = false) {
    const now = Date.now();
    const created = Array.from({ length: count }).map((_, i) => ({
      id: `${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      left: isBurst ? 12 + Math.random() * 76 : 34 + Math.random() * 32,
      drift: -45 + Math.random() * 90,
      scale: 0.75 + Math.random() * 0.65,
      delay: i * 35,
    }));
    setParticles((prev) => [...prev.slice(-26), ...created]);
    setTimeout(() => {
      const ids = new Set(created.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 1450);
  }

  function showBanner(title, subtitle) {
    setIncomingBanner({ title, subtitle, id: Date.now() });
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setIncomingBanner(null);
    }, 4500);
  }

  function maybeBrowserNotify(title, body) {
    if (
      typeof document !== 'undefined' &&
      document.hidden &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, { body, icon: './icon-192.png' });
      } catch {
        // ignore
      }
    }
  }

  // Load state & subscribe to real-time sync (Supabase Realtime on cloud, SSE locally)
  useEffect(() => {
    if (!token || !authMeta?.authorized) return;

    let active = true;

    async function refreshState() {
      try {
        const data = await apiFetch('/api/state');
        if (!active) return;
        setState(data.state);
        if (!isSupabaseRealtimeEnabled() && data.online) {
          setOnline(data.online);
        }
      } catch (err) {
        if (err.status === 401) {
          saveToken('');
          setToken('');
          setState(null);
        }
      }
    }

    refreshState();

    function handleRealtimeEvent(eventName, data = {}) {
      if (!active) return;
      if (data.state) {
        setState(data.state);
      } else {
        refreshState();
      }
      if (data.online) setOnline(data.online);

      const sender =
        data.state?.partners?.[data.from] || stateRef.current?.partners?.[data.from];
      const isFromPartner = data.from && data.from !== myRoleRef.current;

      if (eventName === 'pulse') {
        if (data.telepathy) {
          setTelepathyBanner(true);
          spawnParticles(16, true);
          triggerHaptic([60, 50, 90, 50, 120]);
          if (soundEnabledRef.current) playTelepathySound();
          setTimeout(() => setTelepathyBanner(false), 4800);
        } else if (isFromPartner) {
          setIncomingFlash(true);
          setTimeout(() => setIncomingFlash(false), 950);
          spawnParticles(10, true);
          triggerHaptic([35, 35, 65]);
          if (soundEnabledRef.current) playReceivePing();
          showBanner(
            `${sender?.name || 'TA'} 刚刚对你发来「${data.action?.label || '想你了'}」`,
            data.combo > 1 ? `已经连续心动提醒你 ${data.combo} 次啦` : '轻点这里回抱一下 TA'
          );
          maybeBrowserNotify(
            `${sender?.name || 'TA'}`,
            `刚刚向你发送了「${data.action?.label || '想你了'}」`
          );
        }
      } else if (eventName === 'mood' && isFromPartner) {
        triggerHaptic([30, 40, 30]);
        if (soundEnabledRef.current) playReceivePing();
        showBanner(
          `${sender?.name || 'TA'} 换成了「${data.moodLabel}」状态`,
          data.mood === 'hug' ? 'TA 现在很需要一个大大的抱抱' : '点这里马上回应 TA'
        );
        maybeBrowserNotify(`${sender?.name || 'TA'}`, `此刻状态：${data.moodLabel}`);
      } else if (eventName === 'polaroid' && isFromPartner) {
        spawnParticles(8, true);
        triggerHaptic([40, 30, 40]);
        if (soundEnabledRef.current) playReceivePing();
        showBanner(`${sender?.name || 'TA'} 寄来一张新的拍立得`, data.caption || data.polaroid?.caption || '');
        maybeBrowserNotify(`${sender?.name || 'TA'} 发来新照片`, data.caption || data.polaroid?.caption || '');
      } else if (eventName === 'stamp' && isFromPartner) {
        triggerHaptic([45]);
        if (soundEnabledRef.current) playStampSound();
        showBanner(
          `${sender?.name || 'TA'} 在拍立得上盖了一枚印章`,
          `「${data.label || data.stamp?.label || ''}」`
        );
      } else if (eventName === 'coupon' && isFromPartner) {
        spawnParticles(8, true);
        triggerHaptic([50, 40, 70]);
        if (soundEnabledRef.current) {
          data.actionType === 'accept' ? playStampSound() : playReceivePing();
        }
        const title = data.couponTitle || data.coupon?.title || '特权券';
        showBanner(
          data.actionType === 'accept'
            ? `${sender?.name || 'TA'} 签收了「${title}」`
            : `${sender?.name || 'TA'} 递来一张「${title}」`,
          data.actionType === 'accept' ? '约定生效，记得兑换哦' : '去互动小馆或首页即可签收'
        );
      } else if (eventName === 'question' && isFromPartner) {
        if (soundEnabledRef.current) playReceivePing();
        showBanner(
          data.bothAnswered ? '今日一问答案已双人解锁' : `${sender?.name || 'TA'} 更新了今日一问`,
          data.bothAnswered ? '快去互动小馆看看 TA 写了什么' : '等你写下回答一起揭晓'
        );
      } else if (eventName === 'soothe' && isFromPartner) {
        setIncomingFlash(true);
        setTimeout(() => setIncomingFlash(false), 950);
        spawnParticles(8, true);
        triggerHaptic([35, 35, 50]);
        if (soundEnabledRef.current) playReceivePing();
        showBanner(`${sender?.name || 'TA'} 正在认真哄你`, `「${data.label}」`);
      } else if (eventName === 'peace_resolved') {
        setPeaceBanner(true);
        spawnParticles(16, true);
        triggerHaptic([50, 40, 80]);
        if (soundEnabledRef.current) playTelepathySound();
        setTimeout(() => setPeaceBanner(false), 4500);
      } else if (eventName === 'emotion' && isFromPartner) {
        if (typeof data.level === 'number' && data.level >= 35) {
          triggerHaptic([40, 30, 40]);
          if (soundEnabledRef.current) playReceivePing();
          showBanner(
            `${sender?.name || 'TA'} 的情绪温度升到了 ${data.level}%`,
            '先别急着讲道理，快去情绪台哄哄 TA~'
          );
        } else if (data.active) {
          showBanner(
            `${sender?.name || 'TA'} 开启了冷静呼吸保护`,
            'TA 怕气头上说重话，冷静好就会回来找你'
          );
        } else if (data.type === 'propose') {
          if (soundEnabledRef.current) playReceivePing();
          showBanner(`${sender?.name || 'TA'} 举白旗求和啦`, '快点开「和好」一起雨过天晴吧！');
        }
      }
    }

    if (isSupabaseRealtimeEnabled()) {
      const unsubscribe = subscribeRealtime({
        role: myRole || 'guest',
        onPresence: (p) => {
          if (active) setOnline(p);
        },
        onEvent: handleRealtimeEvent,
      });

      const onVis = () => {
        if (document.visibilityState === 'visible') refreshState();
      };
      document.addEventListener('visibilitychange', onVis);
      const pollTimer = setInterval(refreshState, 5000);

      return () => {
        active = false;
        unsubscribe();
        document.removeEventListener('visibilitychange', onVis);
        clearInterval(pollTimer);
      };
    }

    const roleParam = myRole || 'guest';
    const es = new EventSource(
      `/api/events?role=${encodeURIComponent(roleParam)}&token=${encodeURIComponent(token)}`
    );

    es.addEventListener('init', (e) => {
      const data = JSON.parse(e.data);
      setState(data.state);
      setOnline(data.online || { him: false, her: false });
    });

    es.addEventListener('presence', (e) => {
      const data = JSON.parse(e.data);
      setOnline(data.online || { him: false, her: false });
    });

    [
      'pulse',
      'mood',
      'polaroid',
      'stamp',
      'coupon',
      'question',
      'soothe',
      'peace_resolved',
      'city',
      'settings',
      'wishlist',
      'polaroid_delete',
      'emotion',
    ].forEach((evt) => {
      es.addEventListener(evt, (e) => handleRealtimeEvent(evt, JSON.parse(e.data)));
    });

    return () => {
      active = false;
      es.close();
    };
  }, [token, authMeta?.authorized, myRole]);

  async function handleUnlock(e, chosenRole) {
    e?.preventDefault();
    setAuthError('');
    setUnlocking(true);
    try {
      const res = await apiFetch('/api/auth/unlock', {
        method: 'POST',
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      saveToken(res.token);
      setToken(res.token);
      setState(res.state);
      setOnline(res.online || { him: false, her: false });
      setAuthMeta((prev) => ({ ...(prev || {}), authorized: true }));
      if (chosenRole) {
        selectRole(chosenRole);
      }
    } catch (err) {
      setAuthError(err.message || '口令验证失败');
    } finally {
      setUnlocking(false);
    }
  }

  function selectRole(role) {
    window.localStorage.setItem('love_space_role', role);
    setMyRole(role);
  }

  function handleLockOut() {
    saveToken('');
    setToken('');
    setState(null);
    setAuthMeta((prev) => (prev ? { ...prev, authorized: false } : prev));
  }

  async function requestBrowserNotify() {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifyPermission(perm);
  }

  async function handlePulse(customAction) {
    if (!myRole) return;
    const action = customAction || selectedAction;
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), 2200);

    spawnParticles(6, false);
    triggerHaptic([22]);
    if (soundEnabled) playPulseSound(nextCombo);

    try {
      const data = await apiFetch('/api/pulse', {
        method: 'POST',
        body: JSON.stringify({ from: myRole, action, combo: nextCombo }),
      });
      if (data.state) setState(data.state);
      emitRealtime('pulse', {
        from: myRole,
        action,
        combo: nextCombo,
        telepathy: Boolean(data.telepathy),
      });
    } catch {
      // ignore transient error
    }
  }

  async function handleMoodSwitch(moodObj) {
    if (!myRole) return;
    triggerHaptic([25]);
    if (soundEnabled) playPulseSound(1);
    spawnParticles(4, false);

    const data = await apiFetch('/api/mood', {
      method: 'POST',
      body: JSON.stringify({
        from: myRole,
        mood: moodObj.key,
        moodLabel: moodObj.full,
        moodEmoji: moodObj.emoji,
      }),
    });
    if (data.state) setState(data.state);
    emitRealtime('mood', {
      from: myRole,
      mood: moodObj.key,
      moodLabel: moodObj.full,
    });
  }

  async function handlePolaroidFile(e, openModal = false) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 840, 0.78);
    setPolaroidDraft(compressed);
    setCaptionInput('');
    if (openModal) setShowGlobalPolaroidModal(true);
  }

  async function submitPolaroid(e) {
    e.preventDefault();
    if (!polaroidDraft || !myRole) return;
    setUploadingPolaroid(true);
    const caption = captionInput.trim() || '拍下这一刻寄给你';
    try {
      const data = await apiFetch('/api/polaroid', {
        method: 'POST',
        body: JSON.stringify({
          from: myRole,
          imageData: polaroidDraft,
          caption,
          cityTag: state?.partners?.[myRole]?.city || '此刻',
        }),
      });
      if (data.state) setState(data.state);
      emitRealtime('polaroid', { from: myRole, caption });
      setPolaroidDraft(null);
      setCaptionInput('');
      setShowGlobalPolaroidModal(false);
      spawnParticles(7, true);
      if (soundEnabled) playStampSound();
    } finally {
      setUploadingPolaroid(false);
    }
  }

  async function handleStamp(stampObj, polaroidId) {
    if (!myRole) return;
    triggerHaptic([35]);
    if (soundEnabled) playStampSound();
    const data = await apiFetch('/api/polaroid/stamp', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, polaroidId, ...stampObj }),
    });
    if (data.state) setState(data.state);
    emitRealtime('stamp', { from: myRole, label: stampObj.label });
  }

  async function handleDeletePolaroid(id) {
    const data = await apiFetch(`/api/polaroid/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (data.state) setState(data.state);
    emitRealtime('polaroid_delete', { from: myRole });
  }

  async function handleSaveCity(payload) {
    const data = await apiFetch('/api/city', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, ...payload }),
    });
    if (data.state) setState(data.state);
    emitRealtime('city', { from: myRole });
  }

  async function handleCoupon(couponId, type) {
    triggerHaptic(type === 'accept' ? [45, 30, 45] : [30]);
    if (soundEnabled) {
      type === 'accept' ? playStampSound() : playPulseSound(2);
    }
    const data = await apiFetch('/api/coupon', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, couponId, type }),
    });
    if (data.state) setState(data.state);
    emitRealtime('coupon', {
      from: myRole,
      actionType: type,
      couponTitle: data.coupon?.title,
    });
  }

  async function handleAnswerQuestion(answer) {
    const data = await apiFetch('/api/question/answer', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, answer }),
    });
    if (data.state) setState(data.state);
    if (soundEnabled) playStampSound();
    emitRealtime('question', { from: myRole, bothAnswered: Boolean(data.bothAnswered) });
  }

  async function handleNextQuestion() {
    const data = await apiFetch('/api/question/next', {
      method: 'POST',
      body: JSON.stringify({ from: myRole }),
    });
    if (data.state) setState(data.state);
    emitRealtime('question', { from: myRole, bothAnswered: false });
  }

  async function handleCustomQuestion(prompt) {
    const data = await apiFetch('/api/question/custom', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, prompt }),
    });
    if (data.state) setState(data.state);
    emitRealtime('question', { from: myRole, bothAnswered: false });
  }

  async function handleAddWishlist(text, cityTag) {
    const data = await apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, text, cityTag }),
    });
    if (data.state) setState(data.state);
    emitRealtime('wishlist', { from: myRole });
  }

  async function handleToggleWishlist(id) {
    const data = await apiFetch('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, id }),
    });
    if (data.state) setState(data.state);
    if (soundEnabled) playPulseSound(2);
    emitRealtime('wishlist', { from: myRole });
  }

  async function handleDeleteWishlist(id) {
    const data = await apiFetch(`/api/wishlist/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (data.state) setState(data.state);
    emitRealtime('wishlist', { from: myRole });
  }

  async function handleSaveSettings(payload) {
    const data = await apiFetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.state) setState(data.state);
    emitRealtime('settings', { from: myRole });
  }

  async function handleUpdatePasscode(nextPasscode) {
    const data = await apiFetch('/api/auth/passcode', {
      method: 'POST',
      body: JSON.stringify({ passcode: nextPasscode }),
    });
    if (data.token) {
      saveToken(data.token);
      setToken(data.token);
    }
    if (data.state) setState(data.state);
  }

  async function handleTestPush(target) {
    return apiFetch('/api/push/test', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
  }

  function handlePreviewPartnerReceive() {
    const partnerName = state?.partners?.[myRole === 'her' ? 'him' : 'her']?.name || 'TA';
    setIncomingFlash(true);
    setTimeout(() => setIncomingFlash(false), 950);
    spawnParticles(12, true);
    triggerHaptic([40, 40, 70]);
    if (soundEnabled) playReceivePing();
    showBanner(
      `[预览接收画面] ${partnerName} 刚刚对你发来「${selectedAction.label}」`,
      '对方手机打开小屋时，就会瞬间看到这束光晕、心形粒子与提示音'
    );
  }

  async function handleSetAnger(level) {
    triggerHaptic([28]);
    if (soundEnabled) playPulseSound(1);
    const data = await apiFetch('/api/emotion/anger', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, level }),
    });
    if (data.state) setState(data.state);
    emitRealtime('emotion', { from: myRole, level });
  }

  async function handleSoothe(label) {
    triggerHaptic([25]);
    if (soundEnabled) playPulseSound(2);
    spawnParticles(6, false);
    const data = await apiFetch('/api/emotion/soothe', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, label }),
    });
    if (data.state) setState(data.state);
    emitRealtime('soothe', { from: myRole, label });
  }

  async function handleToggleCooldown(active) {
    triggerHaptic([35]);
    const data = await apiFetch('/api/emotion/cooldown', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, active, minutes: 15 }),
    });
    if (data.state) setState(data.state);
    emitRealtime('emotion', { from: myRole, active });
  }

  async function handlePeace(type) {
    triggerHaptic([40, 30, 60]);
    const data = await apiFetch('/api/emotion/peace', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, type }),
    });
    if (data.state) setState(data.state);
    if (type === 'accept') {
      setPeaceBanner(true);
      spawnParticles(16, true);
      if (soundEnabled) playTelepathySound();
      setTimeout(() => setPeaceBanner(false), 4500);
      emitRealtime('peace_resolved', { from: myRole });
    } else {
      if (soundEnabled) playPulseSound(2);
      emitRealtime('emotion', { from: myRole, type: 'propose' });
    }
  }

  async function handleSavePeaceNote(note) {
    const data = await apiFetch('/api/emotion/note', {
      method: 'POST',
      body: JSON.stringify({ from: myRole, note }),
    });
    if (data.state) setState(data.state);
    emitRealtime('emotion', { from: myRole });
  }

  // Waiting for initial auth check
  if (!authMeta) {
    return (
      <div className="loading-screen">
        <div className="loading-orb">
          <HeartMedallion size={64} />
        </div>
        <p className="serif-title">正在靠近心动小屋...</p>
      </div>
    );
  }

  // Private Passcode Gate
  if (!token || !authMeta.authorized) {
    return (
      <div className="app-shell theme-miss">
        <div className="silk-backdrop" />
        <div className="role-entry-container">
          <form className="letter-card" onSubmit={(e) => handleUnlock(e)}>
            <div className="letter-seal">
              <HeartMedallion size={60} />
            </div>
            <span className="letter-kicker">PRIVATE SPACE</span>
            <h1 className="serif-title">{authMeta.title}</h1>
            <p className="letter-quote">“{authMeta.loveQuote}”</p>
            <div className="letter-divider" />

            <div className="gate-input-group">
              <label className="gate-label">
                <Lock size={13} /> 输入专属空间口令推门进入
              </label>
              <input
                className="gate-input"
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="输入你们的秘密口令"
                autoFocus
              />
              {authMeta.isDefaultPasscode && (
                <div className="gate-hint">
                  首次体验口令：<strong>5201314</strong>（进入后可在设置里随时修改）
                </div>
              )}
              {authError && <div className="gate-error">{authError}</div>}
            </div>

            {myRole ? (
              <button
                type="submit"
                className="primary-btn"
                disabled={unlocking || !passcodeInput.trim()}
              >
                {unlocking ? '验证中...' : '推门进入小屋'}
              </button>
            ) : (
              <>
                <p className="entry-prompt" style={{ marginTop: 14 }}>
                  输入口令后，直接点你的身份进入：
                </p>
                <div className="entry-buttons">
                  <button
                    type="button"
                    className="entry-role-btn"
                    disabled={unlocking}
                    onClick={() => handleUnlock(null, 'him')}
                  >
                    <span className="entry-monogram">{authMeta.partners.him.avatarEmoji}</span>
                    <span className="entry-name">{authMeta.partners.him.name}</span>
                    <span className="entry-device">安卓端视角</span>
                  </button>
                  <button
                    type="button"
                    className="entry-role-btn"
                    disabled={unlocking}
                    onClick={() => handleUnlock(null, 'her')}
                  >
                    <span className="entry-monogram">{authMeta.partners.her.avatarEmoji}</span>
                    <span className="entry-name">{authMeta.partners.her.name}</span>
                    <span className="entry-device">iPhone 端视角</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <div className="loading-orb">
          <HeartMedallion size={64} />
        </div>
        <p className="serif-title">正在同步双人状态...</p>
      </div>
    );
  }

  // Unlocked, but role not yet chosen on this device
  if (!myRole) {
    return (
      <div className="app-shell theme-miss">
        <div className="silk-backdrop" />
        <div className="role-entry-container">
          <div className="letter-card">
            <div className="letter-seal">
              <HeartMedallion size={58} />
            </div>
            <span className="letter-kicker">WHO ARE YOU</span>
            <h1 className="serif-title">{state.couple.title}</h1>
            <p className="entry-prompt">选择你在这台设备上的身份：</p>
            <div className="entry-buttons">
              <button className="entry-role-btn" onClick={() => selectRole('him')}>
                <span className="entry-monogram">{state.partners.him.avatarEmoji}</span>
                <span className="entry-name">{state.partners.him.name}</span>
                <span className="entry-device">安卓端视角</span>
              </button>
              <button className="entry-role-btn" onClick={() => selectRole('her')}>
                <span className="entry-monogram">{state.partners.her.avatarEmoji}</span>
                <span className="entry-name">{state.partners.her.name}</span>
                <span className="entry-device">iPhone 端视角</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const partnerRole = myRole === 'her' ? 'him' : 'her';
  const me = state.partners[myRole];
  const partner = state.partners[partnerRole];
  const partnerOnline = Boolean(online[partnerRole]);

  // Unread badge counts for navigation
  const pendingCouponsCount = (state.coupons || []).filter(
    (c) => c.activeRequest && c.activeRequest.to === myRole && !c.activeRequest.acceptedAt
  ).length;
  const needAnswerQ =
    state.questionState?.current && !state.questionState.current.answers?.[myRole] ? 1 : 0;
  const isTensionMode =
    (me.angerLevel || 0) >= 65 ||
    (partner.angerLevel || 0) >= 65 ||
    (state.emotionControl?.cooldownUntil || 0) > Date.now();
  const emotionAlertCount =
    (partner.angerLevel || 0) > 0 || state.emotionControl?.peaceProposalBy === partnerRole ? 1 : 0;
  const loungeBadge = pendingCouponsCount + needAnswerQ + emotionAlertCount;

  return (
    <div
      className={`app-shell website-shell ${
        isTensionMode ? 'theme-rain' : `theme-${partner.mood}`
      } ${incomingFlash ? 'incoming-flash' : ''}`}
    >
      <div className="silk-backdrop" />

      {/* Luminous SVG Heart Particles */}
      <div className="particles-layer" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="floating-particle"
            style={{
              left: `${p.left}%`,
              '--drift': `${p.drift}px`,
              '--scale': p.scale,
              animationDelay: `${p.delay}ms`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        ))}
      </div>

      {/* Incoming Partner Toast Banner */}
      {incomingBanner && (
        <button
          className="incoming-toast"
          onClick={() => {
            setIncomingBanner(null);
            handlePulse({ key: 'hug', emoji: '🫂', label: '抱紧你' });
          }}
        >
          <Heart size={18} fill="currentColor" className="toast-heart-icon" />
          <div className="toast-text">
            <strong>{incomingBanner.title}</strong>
            <span>{incomingBanner.subtitle}</span>
          </div>
          <span className="toast-cta">回抱 TA</span>
        </button>
      )}

      {/* Telepathy Celebration */}
      {telepathyBanner && (
        <div className="telepathy-overlay">
          <div className="telepathy-card">
            <div className="telepathy-medallion">
              <HeartMedallion size={72} />
            </div>
            <h2 className="serif-title">心有灵犀</h2>
            <p>就在同一瞬间，你们同时想起了彼此</p>
            <span className="telepathy-count">第 {state.telepathyCount} 次同频共振</span>
          </div>
        </div>
      )}

      {/* Peace Resolved Rainbow Celebration */}
      {peaceBanner && (
        <div className="telepathy-overlay">
          <div className="telepathy-card peace-celebration">
            <div className="telepathy-medallion">
              <HeartMedallion size={72} />
            </div>
            <h2 className="serif-title">雨过天晴</h2>
            <p>小别扭清零啦，继续好好爱彼此</p>
            <span className="telepathy-count">情绪已恢复晴天</span>
          </div>
        </div>
      )}

      <div className="workspace-frame">
        {/* Desktop Sidebar Navigation */}
        <aside className="desktop-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-top">
              <HeartMedallion size={36} />
              <div>
                <div className="brand-title serif-title">{state.couple.title}</div>
                <div className="online-status">
                  <span className={`dot ${partnerOnline ? 'on' : 'off'}`} />
                  {partnerOnline ? `${partner.name} 在线` : `${partner.name} 离线`}
                </div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_TABS.map((tab) => {
              const IconComp = tab.icon;
              const badge = tab.id === 'lounge' ? loungeBadge : 0;
              return (
                <button
                  key={tab.id}
                  className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComp size={17} />
                  <span>{tab.fullLabel}</span>
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-quick-pulse"
              onClick={() => handlePulse({ key: 'miss', emoji: '💗', label: '想你了' })}
            >
              <Sparkles size={14} /> 秒发一句「想你了」
            </button>

            <div className="sidebar-tools">
              <button
                className="icon-pill-btn"
                onClick={() => selectRole(myRole === 'him' ? 'her' : 'him')}
                title="快速切换他/她视角"
              >
                <ArrowLeftRight size={14} />
                <span>{me.name}</span>
              </button>
              <button
                className="icon-pill-btn"
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label="音效开关"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="content-viewport">
          {/* Mobile Top Bar */}
          <header className="mobile-top-bar">
            <div className="top-brand">
              <span className="brand-dot" />
              <div>
                <div className="brand-title serif-title">{state.couple.title}</div>
                <div className="online-status">
                  <span className={`dot ${partnerOnline ? 'on' : 'off'}`} />
                  {partnerOnline
                    ? `${partner.name} 正与你同屏`
                    : `${partner.name} 离开中（互动发提醒）`}
                </div>
              </div>
            </div>

            <div className="top-actions">
              <button
                className="icon-pill-btn"
                onClick={() => selectRole(myRole === 'him' ? 'her' : 'him')}
                title="切换他/她视角"
              >
                <ArrowLeftRight size={14} />
                <span>{me.avatarEmoji}</span>
              </button>
              <button
                className="icon-pill-btn"
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label="音效开关"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </header>

          {activeTab === 'home' && (
            <HomePage
              state={state}
              myRole={myRole}
              online={online}
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              combo={combo}
              onPulse={handlePulse}
              onMoodSwitch={handleMoodSwitch}
              polaroidDraft={polaroidDraft}
              setPolaroidDraft={setPolaroidDraft}
              captionInput={captionInput}
              setCaptionInput={setCaptionInput}
              uploadingPolaroid={uploadingPolaroid}
              onPolaroidFile={(e) => handlePolaroidFile(e, false)}
              onSubmitPolaroid={submitPolaroid}
              onStamp={handleStamp}
              onCoupon={handleCoupon}
              onNavigate={setActiveTab}
              onPreviewPartnerReceive={handlePreviewPartnerReceive}
              onSetAnger={handleSetAnger}
              onSoothe={handleSoothe}
              onToggleCooldown={handleToggleCooldown}
              onPeace={handlePeace}
              onSavePeaceNote={handleSavePeaceNote}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryPage
              state={state}
              onSelectCity={(city) => setEditingCity(city)}
              onSelectNextCity={() => setEditingNext(true)}
              onPolaroidFile={(e) => handlePolaroidFile(e, true)}
              onStamp={handleStamp}
              onDeletePolaroid={handleDeletePolaroid}
            />
          )}

          {activeTab === 'lounge' && (
            <LoungePage
              state={state}
              myRole={myRole}
              onAnswerQuestion={handleAnswerQuestion}
              onNextQuestion={handleNextQuestion}
              onCustomQuestion={handleCustomQuestion}
              onAddWishlist={handleAddWishlist}
              onToggleWishlist={handleToggleWishlist}
              onDeleteWishlist={handleDeleteWishlist}
              onCoupon={handleCoupon}
              onSetAnger={handleSetAnger}
              onSoothe={handleSoothe}
              onToggleCooldown={handleToggleCooldown}
              onPeace={handlePeace}
              onSavePeaceNote={handleSavePeaceNote}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              state={state}
              myRole={myRole}
              onSwitchRole={(r) => selectRole(r)}
              onSave={handleSaveSettings}
              onUpdatePasscode={handleUpdatePasscode}
              onTestPush={handleTestPush}
              onRequestBrowserNotify={requestBrowserNotify}
              notifyPermission={notifyPermission}
              onLockOut={handleLockOut}
            />
          )}
        </div>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="主导航">
        {NAV_TABS.map((tab) => {
          const IconComp = tab.icon;
          const badge = tab.id === 'lounge' ? loungeBadge : 0;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="bottom-nav-icon-wrap">
                <IconComp size={19} />
                {badge > 0 && <span className="nav-dot-badge">{badge}</span>}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Polaroid Composer Modal when uploading from Gallery */}
      {showGlobalPolaroidModal && polaroidDraft && (
        <div className="modal-backdrop" onClick={() => setShowGlobalPolaroidModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title serif-title" style={{ marginBottom: 10 }}>
              <Camera size={16} style={{ display: 'inline', verticalAlign: '-2px' }} /> 寄出一张新拍立得
            </h3>
            <form className="polaroid-composer" onSubmit={submitPolaroid}>
              <div className="polaroid-frame drafting">
                <img src={polaroidDraft} alt="待寄出的照片" className="polaroid-img" />
                <input
                  className="polaroid-caption-input"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="写一句此刻想对 TA 说的话..."
                  maxLength={36}
                  autoFocus
                />
              </div>
              <div className="composer-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setPolaroidDraft(null);
                    setShowGlobalPolaroidModal(false);
                  }}
                >
                  取消
                </button>
                <button type="submit" className="primary-btn" disabled={uploadingPolaroid}>
                  <Send size={14} />
                  {uploadingPolaroid ? '寄出中...' : '立刻寄出并存入相册'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCity && (
        <CityModal
          city={editingCity}
          isNext={false}
          onClose={() => setEditingCity(null)}
          onSave={handleSaveCity}
        />
      )}

      {editingNext && (
        <CityModal
          city={state.nextCity}
          isNext={true}
          onClose={() => setEditingNext(false)}
          onSave={handleSaveCity}
        />
      )}
    </div>
  );
}
