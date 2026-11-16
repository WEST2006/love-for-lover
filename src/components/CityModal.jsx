import React, { useState } from 'react';
import { X, Camera, Sparkles, MapPin, Check, Trash2, Plus } from 'lucide-react';
import { compressImageFile } from '../utils/image';

export default function CityModal({ city, isNext, onClose, onSave }) {
  const [name, setName] = useState(city?.name || '');
  const [note, setNote] = useState(city?.note || '');
  const [tagline, setTagline] = useState(city?.tagline || '');
  const [memory, setMemory] = useState(city?.memory || '');
  const [dateLabel, setDateLabel] = useState(city?.dateLabel || '曾一起去过');
  const [photos, setPhotos] = useState(() => {
    if (Array.isArray(city?.photos) && city.photos.length > 0) return city.photos;
    if (city?.photo) return [city.photo];
    return [];
  });
  const [saving, setSaving] = useState(false);

  if (!city) return null;

  async function handleFilesChange(e) {
    const files = Array.from(e.target.files || []).slice(0, 8 - photos.length);
    if (files.length === 0) return;
    const compressedList = [];
    for (const file of files) {
      try {
        const compressed = await compressImageFile(file, 960, 0.82);
        compressedList.push(compressed);
      } catch {
        // ignore bad file
      }
    }
    setPhotos((prev) => [...prev, ...compressedList].slice(0, 8));
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNext) {
        await onSave({ id: 'next', name, note });
      } else {
        await onSave({
          id: city.id,
          tagline,
          memory,
          dateLabel,
          photos,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card city-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>

        {isNext ? (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="modal-badge-row">
              <span className="city-pill-badge">下一站约定</span>
            </div>
            <h3 className="modal-title serif-title">下一个想一起去的地方</h3>
            <p className="modal-sub">把期待写下来，未来的每一次奔赴都在向这里靠近</p>

            <label className="field-label">目的地 / 心愿</label>
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如：海边、雪山、或者任何有你的角落"
              maxLength={24}
            />

            <label className="field-label">到了那里想一起做什么？</label>
            <textarea
              className="field-textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="想一起看日落、散步、拍很多很多合照..."
              maxLength={140}
            />

            <button className="primary-btn" type="submit" disabled={saving}>
              <Sparkles size={16} />
              {saving ? '保存中...' : '存好这个约定'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="modal-badge-row">
              <span className="city-pill-badge">
                {city.name} · {city.subtitle}
              </span>
            </div>

            <label className="field-label">
              旅行照片墙（已存 {photos.length}/8 张，第一张将作为城市封面）
            </label>

            {photos.length > 0 ? (
              <div className="city-album-grid">
                {photos.map((src, idx) => (
                  <div key={idx} className="city-album-thumb">
                    <img src={src} alt={`${city.name}-${idx + 1}`} />
                    <button
                      type="button"
                      className="thumb-delete-btn"
                      onClick={() => removePhoto(idx)}
                      aria-label="删除照片"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 8 && (
                  <label className="city-album-add">
                    <Plus size={20} />
                    <span>加照片</span>
                    <input type="file" accept="image/*" multiple hidden onChange={handleFilesChange} />
                  </label>
                )}
              </div>
            ) : (
              <label className="city-photo-empty">
                <Camera size={22} />
                <span>添加你们在{city.name}旅行时的合照或风景（可多选）</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleFilesChange} />
              </label>
            )}

            <label className="field-label">足迹标记</label>
            <input
              className="field-input"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="比如：2025.10 一起去过"
              maxLength={20}
            />

            <label className="field-label">
              <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> 一句话心动记忆
            </label>
            <input
              className="field-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={80}
            />

            <label className="field-label">属于{city.name}的共同故事</label>
            <textarea
              className="field-textarea"
              rows={3}
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              maxLength={300}
            />

            <button className="primary-btn" type="submit" disabled={saving}>
              <Check size={16} />
              {saving ? '保存中...' : '留住这段记忆'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
