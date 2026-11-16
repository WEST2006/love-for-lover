import React, { useState } from 'react';
import {
  MessageCircleHeart,
  Lock,
  Unlock,
  Shuffle,
  Plus,
  Check,
  Trash2,
  Heart,
  Sparkles,
  Send,
} from 'lucide-react';
import { WaxSealIcon } from '../components/CityArtwork';
import EmotionCarePanel from '../components/EmotionCarePanel';
import { COUPON_ICONS, formatDateTime } from '../utils/constants';

export default function LoungePage({
  state,
  myRole,
  onAnswerQuestion,
  onNextQuestion,
  onCustomQuestion,
  onAddWishlist,
  onToggleWishlist,
  onDeleteWishlist,
  onCoupon,
  onSetAnger,
  onSoothe,
  onToggleCooldown,
  onPeace,
  onSavePeaceNote,
}) {
  const partnerRole = myRole === 'her' ? 'him' : 'her';
  const me = state.partners[myRole];
  const partner = state.partners[partnerRole];

  const curQ = state.questionState?.current;
  const myAnswer = curQ?.answers?.[myRole] || '';
  const partnerAnswer = curQ?.answers?.[partnerRole] || '';
  const bothAnswered = Boolean(myAnswer && partnerAnswer);

  const [answerDraft, setAnswerDraft] = useState(myAnswer);
  const [customMode, setCustomMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  const [wishText, setWishText] = useState('');
  const [wishTag, setWishTag] = useState('见面必做');
  const [addingWish, setAddingWish] = useState(false);

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!answerDraft.trim()) return;
    setSubmittingQ(true);
    try {
      await onAnswerQuestion(answerDraft.trim());
    } finally {
      setSubmittingQ(false);
    }
  }

  async function handleSubmitCustomQ(e) {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setSubmittingQ(true);
    try {
      await onCustomQuestion(customPrompt.trim());
      setCustomPrompt('');
      setCustomMode(false);
      setAnswerDraft('');
    } finally {
      setSubmittingQ(false);
    }
  }

  async function handleAddWish(e) {
    e.preventDefault();
    if (!wishText.trim()) return;
    setAddingWish(true);
    try {
      await onAddWishlist(wishText.trim(), wishTag);
      setWishText('');
    } finally {
      setAddingWish(false);
    }
  }

  const wishlist = state.wishlist || [];
  const doneCount = wishlist.filter((w) => w.done).length;
  const totalCouponRedeemed = (state.coupons || []).reduce(
    (sum, c) => sum + (c.usedCount || 0),
    0
  );

  return (
    <div className="page-stack">
      <div className="page-header-bar">
        <div>
          <h1 className="page-title serif-title">恋爱互动小馆</h1>
          <p className="page-subtitle">每天留几句心里话、攒下见面想做的事、随时递出一张偏爱券</p>
        </div>
      </div>

      <div className="lounge-grid">
        {/* Left: Daily Question + History */}
        <div className="lounge-col">
          <section className="soft-panel question-card">
            <div className="panel-head">
              <h2 className="serif-title">
                <MessageCircleHeart
                  size={17}
                  style={{ display: 'inline', verticalAlign: '-3px', color: '#D1455C' }}
                />{' '}
                每日一问 · 双人解锁
              </h2>
              <div className="q-head-actions">
                <button
                  type="button"
                  className="mini-outline-btn"
                  onClick={() => setCustomMode((v) => !v)}
                >
                  {customMode ? '取消出题' : '我来出题'}
                </button>
                <button
                  type="button"
                  className="mini-outline-btn"
                  onClick={async () => {
                    await onNextQuestion();
                    setAnswerDraft('');
                  }}
                >
                  <Shuffle size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> 换一题
                </button>
              </div>
            </div>

            {customMode ? (
              <form className="custom-q-form" onSubmit={handleSubmitCustomQ}>
                <input
                  className="field-input"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="写一个你想悄悄问 TA 的问题..."
                  maxLength={120}
                  autoFocus
                />
                <button className="primary-btn" type="submit" disabled={submittingQ}>
                  <Send size={14} /> 发布这道问题
                </button>
              </form>
            ) : (
              <>
                <div className="q-prompt-box">
                  <span className="q-badge">
                    {bothAnswered ? (
                      <>
                        <Unlock size={12} /> 双方已解锁
                      </>
                    ) : (
                      <>
                        <Lock size={12} /> 双方答完同时揭晓
                      </>
                    )}
                  </span>
                  <h3 className="serif-title">{curQ?.prompt}</h3>
                </div>

                <div className="answers-split">
                  {/* My Answer */}
                  <div className="answer-box mine">
                    <div className="answer-author">{me.name}（我）</div>
                    {myAnswer ? (
                      <div className="answer-revealed">
                        <p>{myAnswer}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAnswer} className="answer-form">
                        <textarea
                          className="field-textarea"
                          rows={2}
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="写下你的真心话，提交后就能解锁..."
                          maxLength={260}
                        />
                        <button
                          type="submit"
                          className="primary-btn"
                          style={{ marginTop: 6, padding: '9px 12px' }}
                          disabled={submittingQ || !answerDraft.trim()}
                        >
                          提交回答
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Partner Answer */}
                  <div className="answer-box partner">
                    <div className="answer-author">{partner.name}</div>
                    {bothAnswered ? (
                      <div className="answer-revealed">
                        <p>{partnerAnswer}</p>
                      </div>
                    ) : partnerAnswer ? (
                      <div className="answer-locked">
                        <Lock size={16} />
                        <span>{partner.name} 已写好答案，提交你的回答即可揭晓！</span>
                      </div>
                    ) : (
                      <div className="answer-locked waiting">
                        <span>正在等 {partner.name} 写下回答…</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Past Q&A Archive */}
            {(state.questionState?.history || []).length > 0 && (
              <div className="q-history-box">
                <div className="q-history-title">默契问答档案</div>
                <div className="q-history-list">
                  {state.questionState.history.slice(0, 5).map((hq) => (
                    <div key={hq.id} className="q-history-item">
                      <div className="q-history-prompt serif-title">{hq.prompt}</div>
                      <div className="q-history-answers">
                        <span>
                          <strong>{state.partners.him.name}：</strong>
                          {hq.answers?.him || '（未作答）'}
                        </span>
                        <span>
                          <strong>{state.partners.her.name}：</strong>
                          {hq.answers?.her || '（未作答）'}
                        </span>
                      </div>
                      <span className="q-history-time">{formatDateTime(hq.archivedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right: Emotion Control + Wishlist + Coupons */}
        <div className="lounge-col">
          <EmotionCarePanel
            state={state}
            myRole={myRole}
            compact={false}
            onSetAnger={onSetAnger}
            onSoothe={onSoothe}
            onToggleCooldown={onToggleCooldown}
            onPeace={onPeace}
            onSavePeaceNote={onSavePeaceNote}
          />

          <section className="soft-panel">
            <div className="panel-head">
              <h2 className="serif-title">
                <Sparkles
                  size={16}
                  style={{ display: 'inline', verticalAlign: '-3px', color: '#D1455C' }}
                />{' '}
                见面愿望清单
              </h2>
              <span className="panel-tip">
                已实现 {doneCount}/{wishlist.length}
              </span>
            </div>

            <form className="wish-add-form" onSubmit={handleAddWish}>
              <input
                className="field-input"
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="下次见面想一起做什么..."
                maxLength={80}
              />
              <select
                className="wish-tag-select"
                value={wishTag}
                onChange={(e) => setWishTag(e.target.value)}
              >
                <option value="见面必做">见面必做</option>
                <option value="美食约定">美食约定</option>
                <option value="一起去玩">一起去玩</option>
                <option value="小浪漫">小浪漫</option>
              </select>
              <button className="wish-add-btn" type="submit" disabled={addingWish || !wishText.trim()}>
                <Plus size={16} />
              </button>
            </form>

            <div className="wishlist-items">
              {wishlist.map((w) => (
                <div key={w.id} className={`wish-row ${w.done ? 'done' : ''}`}>
                  <button
                    type="button"
                    className={`wish-check ${w.done ? 'checked' : ''}`}
                    onClick={() => onToggleWishlist(w.id)}
                    aria-label="切换完成状态"
                  >
                    {w.done && <Check size={12} />}
                  </button>
                  <div className="wish-content" onClick={() => onToggleWishlist(w.id)}>
                    <span className="wish-text">{w.text}</span>
                    <span className="wish-meta">
                      {w.cityTag} · {state.partners[w.by]?.name} 添加
                    </span>
                  </div>
                  <button
                    type="button"
                    className="wish-del-btn"
                    onClick={() => onDeleteWishlist(w.id)}
                    aria-label="删除愿望"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-panel">
            <div className="panel-head">
              <h2 className="serif-title">一秒撒娇 · 专属特权券</h2>
              <span className="panel-tip">累计已兑现 {totalCouponRedeemed} 次温柔</span>
            </div>

            <div className="coupons-grid">
              {state.coupons.map((coupon) => {
                const req = coupon.activeRequest;
                const isPendingForMe = req && req.to === myRole && !req.acceptedAt;
                const isSentByMeWaiting = req && req.from === myRole && !req.acceptedAt;
                const isAccepted = req && Boolean(req.acceptedAt);
                const IconComp = COUPON_ICONS[coupon.id] || Heart;

                return (
                  <div
                    key={coupon.id}
                    className={`coupon-ticket ${isPendingForMe ? 'pending-me' : ''}`}
                  >
                    <div className="coupon-top">
                      <span className="coupon-icon-box">
                        <IconComp size={15} />
                      </span>
                      <span className="coupon-title">{coupon.title}</span>
                    </div>
                    <p className="coupon-desc">{coupon.desc}</p>

                    {isAccepted && (
                      <div className="wax-seal-overlay">
                        <WaxSealIcon />
                      </div>
                    )}

                    <div className="coupon-actions">
                      {isPendingForMe ? (
                        <button
                          className="coupon-btn accept"
                          onClick={() => onCoupon(coupon.id, 'accept')}
                        >
                          签收这张券
                        </button>
                      ) : isSentByMeWaiting ? (
                        <span className="coupon-waiting">已递给 {partner.name} · 等签收</span>
                      ) : (
                        <button
                          className="coupon-btn send"
                          onClick={() => onCoupon(coupon.id, 'send')}
                        >
                          递给 {partner.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
