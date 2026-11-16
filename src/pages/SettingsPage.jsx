import React, { useState } from 'react';
import { Bell, Check, KeyRound, LogOut, RefreshCw, Smartphone } from 'lucide-react';

const BADGES = ['他', '她', '♡', '✦', '☾', '☀'];

export default function SettingsPage({
  state,
  myRole,
  onSwitchRole,
  onSave,
  onUpdatePasscode,
  onTestPush,
  onRequestBrowserNotify,
  notifyPermission,
  onLockOut,
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

  const [newPasscode, setNewPasscode] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [testMsg, setTestMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveFeedback('');
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
      setSaveFeedback('已保存并同步到双端！');
      setTimeout(() => setSaveFeedback(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasscodeSubmit(e) {
    e.preventDefault();
    setPassMsg('');
    try {
      await onUpdatePasscode(newPasscode.trim());
      setNewPasscode('');
      setPassMsg('专属空间口令已更新！以后进来就用新口令啦。');
    } catch (err) {
      setPassMsg(err.message || '修改口令失败');
    }
  }

  async function handleTest(targetRole) {
    setTestMsg('正在发送测试提醒...');
    const res = await onTestPush(targetRole);
    if (res?.sent) {
      setTestMsg(`已通过 ${res.channel} 发送测试提醒，快看看手机！`);
    } else {
      setTestMsg('请先填写有效的推送地址并点保存设置后再测试');
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header-bar">
        <div>
          <h1 className="page-title serif-title">空间管理与设置</h1>
          <p className="page-subtitle">专属口令保护、纪念日约定、以及锁屏强提醒通道</p>
        </div>
        <button type="button" className="mini-outline-btn" onClick={onLockOut}>
          <LogOut size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> 锁定退出
        </button>
      </div>

      <div className="settings-grid-layout">
        {/* Left: Basic Info & Dates */}
        <form onSubmit={handleSubmit} className="settings-col-form">
          <div className="soft-panel settings-block">
            <div className="settings-section-title">
              <RefreshCw size={14} /> 当前设备身份（单机测试双端时可切换）
            </div>
            <div className="role-switch-row">
              <button
                type="button"
                className={`role-chip ${myRole === 'him' ? 'active' : ''}`}
                onClick={() => onSwitchRole('him')}
              >
                {himName || '男朋友'}（安卓端视角）
              </button>
              <button
                type="button"
                className={`role-chip ${myRole === 'her' ? 'active' : ''}`}
                onClick={() => onSwitchRole('her')}
              >
                {herName || '女朋友'}（iPhone 端视角）
              </button>
            </div>
          </div>

          <div className="soft-panel settings-block">
            <div className="settings-section-title">纪念日与小屋名称</div>
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
            <label className="field-label">首页专属一句话</label>
            <input
              className="field-input"
              value={loveQuote}
              onChange={(e) => setLoveQuote(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="soft-panel settings-block">
            <div className="settings-section-title">双方称呼与各自城市（城市选填）</div>
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
                <label className="field-label">他所在城市（选填）</label>
                <input
                  className="field-input"
                  placeholder="不填则不显示"
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

            <div className="grid-2-inputs" style={{ marginTop: 12 }}>
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
                <label className="field-label">她所在城市（选填）</label>
                <input
                  className="field-input"
                  placeholder="不填则不显示"
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

          <div className="soft-panel settings-block">
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

            <label className="field-label">小屋公网地址（推送跳转用）</label>
            <input
              className="field-input"
              value={appPublicUrl}
              onChange={(e) => setAppPublicUrl(e.target.value)}
              placeholder="部署上线后填写 https://..."
            />

            {testMsg && <p className="test-push-tip">{testMsg}</p>}
          </div>

          <button className="primary-btn" type="submit" disabled={saving}>
            <Check size={16} />
            {saving ? '保存中...' : '保存资料与推送设置'}
          </button>
          {saveFeedback && <p className="save-success-msg">{saveFeedback}</p>}
        </form>

        {/* Right: Security Passcode & Install Guide */}
        <div className="settings-col-side">
          <form onSubmit={handlePasscodeSubmit} className="soft-panel settings-block">
            <div className="settings-section-title">
              <KeyRound size={14} /> 私密空间口令保护
            </div>
            <p className="field-hint">
              {state.securityInfo?.isDefaultPasscode
                ? '当前仍在使用默认体验口令「5201314」，建议改成只有你们俩知道的纪念日或暗号。'
                : '已启用你们自定义的私密口令，外人无法直接进入小屋。'}
            </p>
            <div className="push-input-row">
              <input
                className="field-input"
                type="text"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="输入新口令（4-24位）"
                maxLength={24}
              />
              <button type="submit" className="mini-outline-btn" disabled={newPasscode.trim().length < 4}>
                修改口令
              </button>
            </div>
            {passMsg && <p className="test-push-tip">{passMsg}</p>}
          </form>

          <div className="soft-panel settings-block install-tip-box">
            <div className="settings-section-title">
              <Smartphone size={14} /> 如何变成桌面 App（免反复扫码）
            </div>
            <p>
              <strong>她（iPhone Safari）</strong>：部署到公网后，Safari 打开网址 → 点底部「分享」→「添加到主屏幕」，桌面就会出现独立图标，点开即全屏进入。
            </p>
            <p>
              <strong>你（Android 浏览器）</strong>：Chrome / Edge 打开网址 → 菜单「添加到主屏幕 / 安装应用」；后续也可以直接把前端打包成 `.apk` 安装包。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
