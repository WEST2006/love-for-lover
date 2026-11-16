import React, { useState } from 'react';
import { X, Bell, Heart, Smartphone, RefreshCw, Check } from 'lucide-react';

const BADGES = ['他', '她', '♡', '✦', '☾', '☀'];

export default function SettingsModal({
  state,
  myRole,
  onSwitchRole,
  onSave,
  onTestPush,
  onRequestBrowserNotify,
  notifyPermission,
  onClose,
}) {
  const [title, setTitle] = useState(state.couple.title || '');
  const [loveQuote, setLoveQuote] = useState(state.couple.loveQuote || '');
  const [anniversaryDate, setAnniversaryDate] = useState(state.couple.anniversaryDate || '');
  const [reunionDate, setReunionDate] = useState(state.couple.reunionDate || '');
  const [distanceKm, setDistanceKm] = useState(
    state.couple.distanceKm ? String(state.couple.distanceKm) : ''
  );
  const [appPublicUrl, setAppPublicUrl] = useState(state.couple.appPublicUrl || '');

  const [himName, setHimName] = useState(state.partners.him.name || '');
  const [himCity, setHimCity] = useState(state.partners.him.city || '');
  const [himAvatar, setHimAvatar] = useState(state.partners.him.avatarEmoji || '他');
  const [himPushUrl, setHimPushUrl] = useState(state.partners.him.pushUrl || '');

  const [herName, setHerName] = useState(state.partners.her.name || '');
  const [herCity, setHerCity] = useState(state.partners.her.city || '');
  const [herAvatar, setHerAvatar] = useState(state.partners.her.avatarEmoji || '她');
  const [herPushUrl, setHerPushUrl] = useState(state.partners.her.pushUrl || '');

  const [saving, setSaving] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        couple: {
          title,
          loveQuote,
          anniversaryDate,
          reunionDate,
          distanceKm: Number(distanceKm) || 0,
          appPublicUrl,
        },
        him: { name: himName, city: himCity, avatarEmoji: himAvatar, pushUrl: himPushUrl },
        her: { name: herName, city: herCity, avatarEmoji: herAvatar, pushUrl: herPushUrl },
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(targetRole) {
    setTestMsg('正在发送测试提醒...');
    const res = await onTestPush(targetRole);
    if (res?.sent) {
      setTestMsg(`已通过 ${res.channel} 发送测试提醒，可以查看手机！`);
    } else {
      setTestMsg('请先填写有效的推送地址并点下方保存后再测试');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="modal-body">
          <h3 className="modal-title serif-title">
            <Heart size={17} style={{ display: 'inline', verticalAlign: '-3px', color: '#D6455D' }} />{' '}
            小屋专属设置
          </h3>

          <div className="settings-section">
            <div className="settings-section-title">
              <RefreshCw size={14} /> 当前设备身份（单机双开测试时可快速切换）
            </div>
            <div className="role-switch-row">
              <button
                type="button"
                className={`role-chip ${myRole === 'him' ? 'active' : ''}`}
                onClick={() => onSwitchRole('him')}
              >
                {himName || '男朋友'}（安卓端）
              </button>
              <button
                type="button"
                className={`role-chip ${myRole === 'her' ? 'active' : ''}`}
                onClick={() => onSwitchRole('her')}
              >
                {herName || '女朋友'}（iPhone 端）
              </button>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">纪念日与见面约定</div>
            <div className="grid-2-inputs">
              <div>
                <label className="field-label">小屋名称</label>
                <input
                  className="field-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={24}
                />
              </div>
              <div>
                <label className="field-label">两地相隔 (km，选填)</label>
                <input
                  className="field-input"
                  type="number"
                  placeholder="不填则不显示"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">在一起纪念日（选填）</label>
                <input
                  className="field-input"
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">下次见面日期（选填）</label>
                <input
                  className="field-input"
                  type="date"
                  value={reunionDate}
                  onChange={(e) => setReunionDate(e.target.value)}
                />
              </div>
            </div>
            <label className="field-label">首页想对 TA 说的话</label>
            <input
              className="field-input"
              value={loveQuote}
              onChange={(e) => setLoveQuote(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="settings-section">
            <div className="settings-section-title">双方称呼与常驻地（城市选填）</div>
            <div className="grid-2-inputs">
              <div>
                <label className="field-label">他的昵称</label>
                <input
                  className="field-input"
                  value={himName}
                  onChange={(e) => setHimName(e.target.value)}
                  maxLength={16}
                />
              </div>
              <div>
                <label className="field-label">他所在的城市（选填）</label>
                <input
                  className="field-input"
                  placeholder="选填，不填不显示"
                  value={himCity}
                  onChange={(e) => setHimCity(e.target.value)}
                  maxLength={12}
                />
              </div>
            </div>
            <div className="avatar-picker">
              {BADGES.map((a) => (
                <button
                  type="button"
                  key={`him-${a}`}
                  className={`avatar-opt ${himAvatar === a ? 'active' : ''}`}
                  onClick={() => setHimAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="grid-2-inputs" style={{ marginTop: 10 }}>
              <div>
                <label className="field-label">她的昵称</label>
                <input
                  className="field-input"
                  value={herName}
                  onChange={(e) => setHerName(e.target.value)}
                  maxLength={16}
                />
              </div>
              <div>
                <label className="field-label">她所在的城市（选填）</label>
                <input
                  className="field-input"
                  placeholder="选填，不填不显示"
                  value={herCity}
                  onChange={(e) => setHerCity(e.target.value)}
                  maxLength={12}
                />
              </div>
            </div>
            <div className="avatar-picker">
              {BADGES.map((a) => (
                <button
                  type="button"
                  key={`her-${a}`}
                  className={`avatar-opt ${herAvatar === a ? 'active' : ''}`}
                  onClick={() => setHerAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <Bell size={14} /> 锁屏强提醒通道（可选）
            </div>
            <div className="notify-helper-row">
              <button type="button" className="mini-outline-btn" onClick={onRequestBrowserNotify}>
                {notifyPermission === 'granted' ? '本机浏览器通知已开启' : '开启本机浏览器通知'}
              </button>
            </div>

            <label className="field-label">
              她的 iPhone 推送（推荐填 Bark 地址，如 https://api.day.app/你的Key）
            </label>
            <div className="push-input-row">
              <input
                className="field-input"
                value={herPushUrl}
                onChange={(e) => setHerPushUrl(e.target.value)}
                placeholder="选填：Bark / PushPlus / Webhook URL"
              />
              <button type="button" className="mini-outline-btn" onClick={() => handleTest('her')}>
                测试
              </button>
            </div>

            <label className="field-label">
              他的安卓推送（如 PushPlus / 飞书 / 企业微信 / ntfy Webhook）
            </label>
            <div className="push-input-row">
              <input
                className="field-input"
                value={himPushUrl}
                onChange={(e) => setHimPushUrl(e.target.value)}
                placeholder="选填：PushPlus / Webhook URL"
              />
              <button type="button" className="mini-outline-btn" onClick={() => handleTest('him')}>
                测试
              </button>
            </div>

            <label className="field-label">小屋公网地址（点击推送通知时跳回）</label>
            <input
              className="field-input"
              value={appPublicUrl}
              onChange={(e) => setAppPublicUrl(e.target.value)}
              placeholder="部署上线后填写 https://..."
            />

            {testMsg && <p className="test-push-tip">{testMsg}</p>}
          </div>

          <div className="settings-section install-tip-box">
            <div className="settings-section-title">
              <Smartphone size={14} /> 免扫码桌面图标指南
            </div>
            <p>
              • <strong>她（iPhone Safari）</strong>：打开网址 → 点底部「分享」→「添加到主屏幕」，以后桌面点图标秒开。
            </p>
            <p>
              • <strong>你（Android 浏览器）</strong>：打开网址 → 菜单「添加到桌面 / 安装应用」，后续可直接为你打包 APK。
            </p>
          </div>

          <button className="primary-btn" type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? '保存中...' : '保存设置并同步给 TA'}
          </button>
        </form>
      </div>
    </div>
  );
}
