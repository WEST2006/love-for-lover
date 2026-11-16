import React, { useEffect, useState } from 'react';
import { CloudRain, Flame, Flag, HeartHandshake, PauseCircle, Sparkles, Sun, Wind } from 'lucide-react';
import { ANGER_LEVELS, SOOTHE_ACTIONS, formatRelativeTime } from '../utils/constants';

function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function EmotionCarePanel({
  state,
  myRole,
  compact = false,
  onSetAnger,
  onSoothe,
  onToggleCooldown,
  onPeace,
  onSavePeaceNote,
}) {
  const partnerRole = myRole === 'her' ? 'him' : 'her';
  const me = state.partners[myRole];
  const partner = state.partners[partnerRole];
  const emotion = state.emotionControl || {};

  const myAnger = me.angerLevel || 0;
  const partnerAnger = partner.angerLevel || 0;
  const anyUpset = myAnger > 0 || partnerAnger > 0;
  const highTension = myAnger >= 65 || partnerAnger >= 65;

  const [nowMs, setNowMs] = useState(() => Date.now());
  const cooldownLeft = Math.max(0, (emotion.cooldownUntil || 0) - nowMs);
  const inCooldown = cooldownLeft > 0;

  const [noteDraft, setNoteDraft] = useState(emotion.peaceNotes?.[myRole] || '');
  const [noteSavedMsg, setNoteSavedMsg] = useState('');

  useEffect(() => {
    setNoteDraft(emotion.peaceNotes?.[myRole] || '');
  }, [myRole, emotion.peaceNotes]);

  useEffect(() => {
    if (!emotion.cooldownUntil || emotion.cooldownUntil <= Date.now()) return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [emotion.cooldownUntil]);

  const peaceProposedByPartner =
    emotion.peaceProposalBy && emotion.peaceProposalBy === partnerRole;
  const peaceProposedByMe = emotion.peaceProposalBy && emotion.peaceProposalBy === myRole;

  async function handleSaveNote(e) {
    e.preventDefault();
    await onSavePeaceNote(noteDraft);
    setNoteSavedMsg('已存好！万一以后吵架超过 65% 会自动亮给 TA 看');
    setTimeout(() => setNoteSavedMsg(''), 3200);
  }

  return (
    <section className={`soft-panel emotion-panel ${anyUpset || inCooldown ? 'tension-active' : ''}`}>
      <div className="panel-head">
        <div>
          <h2 className="serif-title">
            {anyUpset || inCooldown ? (
              <CloudRain size={16} style={{ display: 'inline', verticalAlign: '-3px', color: '#8A5678' }} />
            ) : (
              <Sun size={16} style={{ display: 'inline', verticalAlign: '-3px', color: '#D1455C' }} />
            )}{' '}
            情绪温度计与降温台
          </h2>
          <span className="panel-tip">
            {anyUpset
              ? '先照顾情绪，再解决事情，不许冷战失联'
              : '闹别扭或委屈时点一下，让对方秒懂怎么哄你'}
          </span>
        </div>
      </div>

      {/* Hidden Peace Note automatically revealed during high tension or cooldown */}
      {(highTension || inCooldown) && emotion.peaceNotes?.[partnerRole] && (
        <div className="revealed-peace-note">
          <span className="revealed-kicker">
            <Sparkles size={12} /> {partner.name} 平时悄悄留给吵架时的你
          </span>
          <p className="serif-title">“{emotion.peaceNotes[partnerRole]}”</p>
        </div>
      )}

      {/* 15-Minute Cooldown Breathing Shield */}
      {inCooldown && (
        <div className="cooldown-shield-box">
          <div className="breathing-circle">
            <Wind size={22} />
            <strong>{formatCountdown(cooldownLeft)}</strong>
          </div>
          <div className="cooldown-copy">
            <strong>
              {emotion.cooldownBy === myRole
                ? '你开启了冷静呼吸保护'
                : `${partner.name} 开启了冷静呼吸保护`}
            </strong>
            <p>
              我不是要冷战，只是怕气头上说重话伤到你。跟着光圈慢呼吸，走过重庆、成都、南京、石家庄的我们值得温柔以待。
            </p>
            <button
              type="button"
              className="mini-outline-btn"
              onClick={() => onToggleCooldown(false)}
            >
              我冷静好啦，结束倒计时
            </button>
          </div>
        </div>
      )}

      {/* My Emotion Thermometer */}
      <div className="thermo-block">
        <div className="thermo-row-head">
          <span>我的情绪温度</span>
          <strong className={myAnger >= 65 ? 'hot' : ''}>{myAnger}%</strong>
        </div>
        <div className="thermo-pills">
          {ANGER_LEVELS.map((item) => (
            <button
              key={item.level}
              type="button"
              className={`thermo-pill lvl-${item.level} ${myAnger === item.level ? 'active' : ''}`}
              onClick={() => onSetAnger(item.level)}
            >
              <span>{item.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Partner Emotion Status & Coax Console */}
      <div className="thermo-block partner-thermo">
        <div className="thermo-row-head">
          <span>{partner.name} 的情绪温度</span>
          <strong className={partnerAnger >= 65 ? 'hot' : ''}>
            {partnerAnger === 0
              ? '晴天平静 0%'
              : partnerAnger >= 90
              ? `火山预警 ${partnerAnger}%`
              : partnerAnger >= 65
              ? `气鼓鼓中 ${partnerAnger}%`
              : `有点小委屈 ${partnerAnger}%`}
          </strong>
        </div>

        <div className="thermo-bar-track">
          <div
            className={`thermo-bar-fill ${partnerAnger >= 65 ? 'hot' : ''}`}
            style={{ width: `${Math.max(4, partnerAnger)}%` }}
          />
        </div>

        {partnerAnger > 0 && (
          <div className="soothe-console">
            <div className="soothe-title">
              <Flame size={13} /> 灭火哄哄台（点一下直接送到 TA 屏幕降温）
            </div>
            <div className="soothe-grid">
              {SOOTHE_ACTIONS.map((act) => (
                <button
                  key={act.key}
                  type="button"
                  className="soothe-btn"
                  onClick={() => onSoothe(act.label)}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Coaxing Feedback Visible to Upset Partner */}
      {(emotion.recentSoothes || []).length > 0 && (
        <div className="soothe-log-box">
          <div className="soothe-log-head">刚刚的哄哄努力</div>
          {emotion.recentSoothes.slice(0, 3).map((item) => (
            <div key={item.id} className="soothe-log-row">
              <span>
                <strong>{state.partners[item.from]?.name}</strong>：{item.label}
              </span>
              <span>{formatRelativeTime(item.createdAt)}</span>
            </div>
          ))}
          {myAnger > 0 && (
            <div className="forgive-quick-row">
              <button
                type="button"
                className="mini-outline-btn"
                onClick={() => onSetAnger(Math.max(0, myAnger - 35))}
              >
                好吧，消气一点 (-35%)
              </button>
              <button
                type="button"
                className="peace-accept-btn"
                onClick={() => onPeace('accept')}
              >
                不气啦，雨过天晴
              </button>
            </div>
          )}
        </div>
      )}

      {/* Peace Flag & Cooldown Triggers */}
      <div className="emotion-footer-actions">
        {peaceProposedByPartner ? (
          <button
            type="button"
            className="peace-accept-btn full"
            onClick={() => onPeace('accept')}
          >
            <HeartHandshake size={16} /> {partner.name} 举白旗求和啦！点我雨过天晴
          </button>
        ) : peaceProposedByMe ? (
          <div className="peace-waiting-pill">已举白旗求和，等 {partner.name} 点头和好…</div>
        ) : (
          <>
            {!inCooldown && (
              <button
                type="button"
                className="mini-outline-btn"
                onClick={() => onToggleCooldown(true)}
              >
                <PauseCircle size={13} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                先冷静 15 分钟
              </button>
            )}
            {(anyUpset || inCooldown) && (
              <button
                type="button"
                className="peace-propose-btn"
                onClick={() => onPeace('propose')}
              >
                <Flag size={13} /> 举白旗求和
              </button>
            )}
          </>
        )}
      </div>

      {/* Peace-Time Hidden Note Editor (shown in full mode on LoungePage) */}
      {!compact && (
        <form onSubmit={handleSaveNote} className="peace-note-editor">
          <label className="field-label">
            写一句给“万一吵架时的 TA”看的话（平时藏起来，怒气 ≥65% 时自动亮出）
          </label>
          <div className="push-input-row">
            <input
              className="field-input"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="比如：不管怎么吵架，我都是真的很想和你好好的"
              maxLength={140}
            />
            <button type="submit" className="mini-outline-btn">
              存好
            </button>
          </div>
          {noteSavedMsg && <span className="test-push-tip">{noteSavedMsg}</span>}
        </form>
      )}
    </section>
  );
}
