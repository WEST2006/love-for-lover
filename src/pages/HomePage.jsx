import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Camera,
  Send,
  CalendarHeart,
  ChevronRight,
  MessageCircleHeart,
  Eye,
  CloudRain,
} from 'lucide-react';
import { HeartMedallion } from '../components/CityArtwork';
import EmotionCarePanel from '../components/EmotionCarePanel';
import {
  COUPON_ICONS,
  MOODS,
  PULSE_ACTIONS,
  STAMPS,
  diffDaysFromToday,
  formatRelativeTime,
} from '../utils/constants';

export function DefaultPolaroidArt() {
  return (
    <div className="default-polaroid-art">
      <svg viewBox="0 0 420 270" className="polaroid-svg" aria-hidden="true">
        <defs>
          <linearGradient id="velvetSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63263A" />
            <stop offset="48%" stopColor="#B84B62" />
            <stop offset="100%" stopColor="#F09C82" />
          </linearGradient>
          <radialGradient id="warmMoon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF5E6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFD1B3" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="420" height="270" fill="url(#velvetSky)" />
        <circle cx="315" cy="70" r="65" fill="url(#warmMoon)" opacity="0.55" />
        <circle cx="315" cy="70" r="22" fill="#FFF7EB" opacity="0.9" />
        <path
          d="M0 198 Q110 156 220 186 T420 172 L420 270 L0 270 Z"
          fill="#4A1A29"
          opacity="0.45"
        />
        <path
          d="M0 220 Q150 185 280 212 T420 202 L420 270 L0 270 Z"
          fill="#2F0E19"
          opacity="0.65"
        />
        <path
          d="M84 148 Q210 62 336 138"
          fill="none"
          stroke="#FFE8DC"
          strokeWidth="1.6"
          strokeDasharray="4 6"
          opacity="0.7"
        />
        <circle cx="84" cy="148" r="4.5" fill="#FFF3EC" />
        <circle cx="336" cy="138" r="4.5" fill="#FFF3EC" />
        <path
          d="M210 92 C210 86 202 84 199 89 C196 84 188 86 188 92 C188 99 199 106 199 106 C199 106 210 99 210 92 Z"
          transform="translate(11, -6)"
          fill="#FFE8E0"
        />
      </svg>
      <div className="default-art-overlay">
        <span className="default-art-kicker">OUR MOMENTS</span>
        <div className="default-art-cities serif-title">重庆 · 成都 · 南京 · 石家庄</div>
        <div className="default-art-hint">拍一张此刻的风景或合照寄给 TA</div>
      </div>
    </div>
  );
}

export default function HomePage({
  state,
  myRole,
  online,
  selectedAction,
  setSelectedAction,
  combo,
  onPulse,
  onMoodSwitch,
  polaroidDraft,
  setPolaroidDraft,
  captionInput,
  setCaptionInput,
  uploadingPolaroid,
  onPolaroidFile,
  onSubmitPolaroid,
  onStamp,
  onCoupon,
  onNavigate,
  onPreviewPartnerReceive,
  onSetAnger,
  onSoothe,
  onToggleCooldown,
  onPeace,
  onSavePeaceNote,
}) {
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const partnerRole = myRole === 'her' ? 'him' : 'her';
  const me = state.partners[myRole];
  const partner = state.partners[partnerRole];
  const partnerOnline = Boolean(online[partnerRole]);
  const partnerMoodObj = MOODS.find((m) => m.key === partner.mood) || MOODS[1];
  const hasEmotionTension =
    (me.angerLevel || 0) > 0 ||
    (partner.angerLevel || 0) > 0 ||
    (state.emotionControl?.cooldownUntil || 0) > Date.now() ||
    Boolean(state.emotionControl?.peaceProposalBy);

  const loveDays = state.couple.anniversaryDate
    ? Math.max(1, -(diffDaysFromToday(state.couple.anniversaryDate) ?? 0) + 1)
    : null;
  const reunionDays = state.couple.reunionDate
    ? diffDaysFromToday(state.couple.reunionDate)
    : null;

  const totalPhotosCount =
    (state.polaroid?.imageData ? 1 : 0) + (state.polaroidHistory?.length || 0);

  const curQuestion = state.questionState?.current;
  const iAnsweredQ = Boolean(curQuestion?.answers?.[myRole]);
  const partnerAnsweredQ = Boolean(curQuestion?.answers?.[partnerRole]);

  const pendingCoupons = (state.coupons || []).filter(
    (c) => c.activeRequest && c.activeRequest.to === myRole && !c.activeRequest.acceptedAt
  );

  return (
    <div className="home-layout">
      {/* Left / Primary Resonance Column */}
      <div className="home-col-primary">
        {partner.mood === 'hug' && (
          <div className="urgent-mood-banner">
            <div>
              <strong>{partner.name} 此刻很想被抱紧</strong>
              <span>点一下右边，让 TA 立刻感受到你在</span>
            </div>
            <button
              className="urgent-hug-btn"
              onClick={() => onPulse({ key: 'hug', emoji: '🫂', label: '抱紧你' })}
            >
              马上抱紧
            </button>
          </div>
        )}

        <section className="hero-stage">
          <div className="connection-arc">
            <div className="person-node">
              <div className="monogram-ring mine">{me.avatarEmoji}</div>
              <div className="person-labels">
                <strong>{me.name}</strong>
                {me.city && <span>{me.city}</span>}
              </div>
            </div>

            <div className="pulse-bridge">
              <div className="bridge-track">
                <Heart size={13} fill="#D6455D" color="#D6455D" className="bridge-heart-icon" />
              </div>
              <div className="bridge-sub">
                {state.couple.distanceKm > 0
                  ? `相隔 ${state.couple.distanceKm} km · 心跳同频`
                  : '山海之间 · 心跳同频'}
              </div>
            </div>

            <div className="person-node right">
              <div className="person-labels right">
                <strong>{partner.name}</strong>
                <span>
                  {partner.city ? `${partner.city} · ` : ''}
                  {partnerMoodObj.full}
                </span>
              </div>
              <div className={`monogram-ring partner ${partnerOnline ? 'online' : ''}`}>
                {partner.avatarEmoji}
              </div>
            </div>
          </div>

          <p className="hero-quote serif-title">“{state.couple.loveQuote}”</p>

          <div className="milestones-strip">
            <button className="milestone-pill" onClick={() => onNavigate('settings')}>
              <CalendarHeart size={13} />
              <span>{loveDays !== null ? `相爱第 ${loveDays} 天` : '设置我们的纪念日'}</span>
            </button>
            <button className="milestone-pill warm" onClick={() => onNavigate('settings')}>
              <Sparkles size={13} />
              <span>
                {reunionDays === null
                  ? '约定下次见面日'
                  : reunionDays > 0
                  ? `距下次拥抱还有 ${reunionDays} 天`
                  : reunionDays === 0
                  ? '就是今天！终于见面啦'
                  : '重新约定下次见面'}
              </span>
            </button>
          </div>

          {/* Sculpted Velvet Heart Medallion */}
          <div className="medallion-stage">
            <div className="medallion-aura aura-1" />
            <div className="medallion-aura aura-2" />
            <button
              className="medallion-btn"
              onClick={() => onPulse()}
              aria-label={`发送${selectedAction.label}`}
            >
              <HeartMedallion size={92} />
              <span className="medallion-cta">轻触 · {selectedAction.label}</span>
              {combo > 1 && <span className="combo-badge">连击 ×{combo}</span>}
            </button>
          </div>

          <div className="action-tabs">
            {PULSE_ACTIONS.map((act) => (
              <button
                key={act.key}
                className={`action-tab ${selectedAction.key === act.key ? 'active' : ''}`}
                onClick={() => setSelectedAction(act)}
              >
                {act.label}
              </button>
            ))}
          </div>

          <div className="pulse-metrics">
            <span>
              今天已想 TA <strong>{me.missCountToday}</strong> 次
            </span>
            <span className="sep">·</span>
            <span>
              TA 想我 <strong>{partner.missCountToday}</strong> 次
            </span>
            <span className="sep">·</span>
            <span>
              心有灵犀 <strong>{state.telepathyCount}</strong> 次
            </span>
          </div>

          <button
            type="button"
            className="preview-feedback-btn"
            onClick={onPreviewPartnerReceive}
          >
            <Eye size={13} /> 预览 TA 收到反馈时的画面与提示音
          </button>
        </section>

        {/* Mood Strip */}
        <section className="soft-panel">
          <div className="panel-head">
            <h2 className="serif-title">此刻状态</h2>
            <button
              type="button"
              className="inline-link-btn"
              onClick={() => setShowEmotionPanel((v) => !v)}
            >
              <CloudRain size={13} /> {showEmotionPanel || hasEmotionTension ? '收起情绪台' : '闹别扭了 / 调情绪温度'}
            </button>
          </div>
          <div className="mood-rail">
            {MOODS.map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.key}
                  className={`mood-chip ${me.mood === m.key ? 'active' : ''}`}
                  onClick={() => onMoodSwitch(m)}
                >
                  <IconComp size={15} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {(showEmotionPanel || hasEmotionTension) && (
          <EmotionCarePanel
            state={state}
            myRole={myRole}
            compact={true}
            onSetAnger={onSetAnger}
            onSoothe={onSoothe}
            onToggleCooldown={onToggleCooldown}
            onPeace={onPeace}
            onSavePeaceNote={onSavePeaceNote}
          />
        )}
      </div>

      {/* Right / Secondary Memory & Quick Action Column */}
      <div className="home-col-secondary">
        {/* Pending Coupon Alert if any */}
        {pendingCoupons.map((coupon) => {
          const IconComp = COUPON_ICONS[coupon.id] || Heart;
          return (
            <div key={coupon.id} className="soft-panel pending-coupon-spotlight">
              <div className="spotlight-left">
                <span className="coupon-icon-box">
                  <IconComp size={16} />
                </span>
                <div>
                  <strong>
                    {partner.name} 递来一张「{coupon.title}」
                  </strong>
                  <span>{coupon.desc}</span>
                </div>
              </div>
              <button
                className="coupon-btn accept"
                style={{ width: 'auto', padding: '8px 14px' }}
                onClick={() => onCoupon(coupon.id, 'accept')}
              >
                签收
              </button>
            </div>
          );
        })}

        {/* Polaroid Card */}
        <section className="soft-panel polaroid-panel">
          <div className="panel-head">
            <div>
              <h2 className="serif-title">寄给你的此刻</h2>
              {totalPhotosCount > 0 && (
                <button className="inline-link-btn" onClick={() => onNavigate('gallery')}>
                  浏览全部 {totalPhotosCount} 张拍立得 <ChevronRight size={13} />
                </button>
              )}
            </div>
            <label className="rose-pill-action">
              <Camera size={13} /> 拍一张寄给 TA
              <input type="file" accept="image/*" hidden onChange={onPolaroidFile} />
            </label>
          </div>

          {polaroidDraft ? (
            <form className="polaroid-composer" onSubmit={onSubmitPolaroid}>
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
                  onClick={() => setPolaroidDraft(null)}
                >
                  重选
                </button>
                <button type="submit" className="primary-btn" disabled={uploadingPolaroid}>
                  <Send size={14} />
                  {uploadingPolaroid ? '寄出中...' : '立刻寄到 TA 桌面'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="polaroid-frame">
                <div className="polaroid-media-wrap">
                  {state.polaroid.imageData ? (
                    <img
                      src={state.polaroid.imageData}
                      alt={state.polaroid.caption}
                      className="polaroid-img"
                    />
                  ) : (
                    <DefaultPolaroidArt />
                  )}

                  {(state.polaroid.stamps || []).map((st) => (
                    <div
                      key={st.id}
                      className="ink-stamp"
                      style={{
                        left: `${st.x}%`,
                        top: `${st.y}%`,
                        transform: `translate(-50%, -50%) rotate(${st.rotate}deg)`,
                      }}
                    >
                      <span>{st.label}</span>
                    </div>
                  ))}
                </div>

                <div className="polaroid-footer">
                  <p className="polaroid-caption serif-title">{state.polaroid.caption}</p>
                  <div className="polaroid-meta">
                    <span>来自 {state.partners[state.polaroid.author]?.name}</span>
                    <span>{formatRelativeTime(state.polaroid.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="stamp-bar">
                <span className="stamp-bar-label">给这张照片盖个印章</span>
                <div className="stamp-buttons">
                  {STAMPS.map((st) => (
                    <button
                      key={st.label}
                      className="stamp-btn"
                      onClick={() => onStamp(st, state.polaroid.id)}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Daily Question Teaser Card */}
        {curQuestion && (
          <button className="soft-panel teaser-card" onClick={() => onNavigate('lounge')}>
            <div className="teaser-top">
              <span className="teaser-tag">
                <MessageCircleHeart size={13} /> 今日一问
              </span>
              <span className="teaser-status">
                {iAnsweredQ && partnerAnsweredQ
                  ? '双方已解锁'
                  : partnerAnsweredQ
                  ? `${partner.name} 已作答，等你解锁`
                  : iAnsweredQ
                  ? `等 ${partner.name} 回答`
                  : '等你写下一句话'}
              </span>
            </div>
            <p className="teaser-prompt serif-title">{curQuestion.prompt}</p>
            <span className="teaser-link">
              去互动小馆作答 <ChevronRight size={14} />
            </span>
          </button>
        )}

        {/* Quiet Timeline */}
        <section className="soft-panel">
          <div className="panel-head" style={{ marginBottom: 10 }}>
            <h2 className="serif-title">最近的心动足迹</h2>
          </div>
          <div className="feed-list">
            {(state.recentEvents || []).slice(0, 6).map((evt) => (
              <div key={evt.id} className="feed-item">
                <span className="feed-dot" />
                <span className="feed-text">
                  <strong>{state.partners[evt.by]?.name}</strong> {evt.text}
                </span>
                <span className="feed-time">{formatRelativeTime(evt.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
