import React, { useMemo, useState } from 'react';
import { Camera, MapPin, Image as ImageIcon, Trash2, X, ChevronRight } from 'lucide-react';
import { CityArtwork } from '../components/CityArtwork';
import { STAMPS, formatDateTime } from '../utils/constants';

export default function GalleryPage({
  state,
  onSelectCity,
  onSelectNextCity,
  onPolaroidFile,
  onStamp,
  onDeletePolaroid,
}) {
  const [filter, setFilter] = useState('all'); // all | polaroids | cities
  const [lightboxItem, setLightboxItem] = useState(null);

  const allPolaroids = useMemo(() => {
    const items = [];
    if (state.polaroid?.imageData) {
      items.push(state.polaroid);
    }
    for (const hist of state.polaroidHistory || []) {
      if (hist?.imageData) items.push(hist);
    }
    return items;
  }, [state.polaroid, state.polaroidHistory]);

  // Keep lightbox item synced with updated stamps
  const activeLightbox = useMemo(() => {
    if (!lightboxItem) return null;
    return allPolaroids.find((p) => p.id === lightboxItem.id) || lightboxItem;
  }, [lightboxItem, allPolaroids]);

  return (
    <div className="page-stack">
      <div className="page-header-bar">
        <div>
          <h1 className="page-title serif-title">时光相册与旅行足迹</h1>
          <p className="page-subtitle">
            把走过的每一座城、寄给彼此的每一张此刻，都好好留在这里
          </p>
        </div>

        <label className="rose-pill-action">
          <Camera size={14} /> 存入新拍立得
          <input type="file" accept="image/*" hidden onChange={onPolaroidFile} />
        </label>
      </div>

      <div className="subfilter-tabs">
        <button
          className={`subfilter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部记忆
        </button>
        <button
          className={`subfilter-btn ${filter === 'cities' ? 'active' : ''}`}
          onClick={() => setFilter('cities')}
        >
          去过的城市 ({state.cities.length})
        </button>
        <button
          className={`subfilter-btn ${filter === 'polaroids' ? 'active' : ''}`}
          onClick={() => setFilter('polaroids')}
        >
          拍立得墙 ({allPolaroids.length})
        </button>
      </div>

      {/* Visited Cities Grid */}
      {(filter === 'all' || filter === 'cities') && (
        <section className="gallery-section">
          <div className="panel-head">
            <h2 className="serif-title">
              <MapPin size={16} style={{ display: 'inline', verticalAlign: '-3px' }} /> 我们一起走过的 4 座城
            </h2>
            <span className="panel-tip">点开可上传多张旅行合照、写下当时的故事</span>
          </div>

          <div className="cities-gallery-grid">
            {state.cities.map((city) => {
              const photoCount = Array.isArray(city.photos)
                ? city.photos.length
                : city.photo
                ? 1
                : 0;
              const cover = (Array.isArray(city.photos) && city.photos[0]) || city.photo;

              return (
                <button
                  key={city.id}
                  className="city-gallery-card"
                  onClick={() => onSelectCity(city)}
                >
                  <div className="city-gallery-art">
                    {cover ? (
                      <img src={cover} alt={city.name} className="postcard-photo" />
                    ) : (
                      <CityArtwork cityId={city.id} />
                    )}
                    <span className="postcard-tag">{city.dateLabel}</span>
                    {photoCount > 0 && (
                      <span className="photo-count-badge">
                        <ImageIcon size={11} /> {photoCount} 张
                      </span>
                    )}
                  </div>

                  <div className="city-gallery-body">
                    <div className="postcard-title-row">
                      <h3 className="serif-title">{city.name}</h3>
                      <span className="postcard-sub">{city.subtitle}</span>
                    </div>
                    <p className="city-gallery-tagline">{city.tagline}</p>
                    <p className="city-gallery-memory">{city.memory}</p>
                  </div>
                </button>
              );
            })}

            <button className="city-gallery-card next-card" onClick={onSelectNextCity}>
              <div className="next-card-inner" style={{ padding: 24 }}>
                <span className="next-kicker">NEXT CHAPTER</span>
                <h3 className="serif-title">{state.nextCity.name}</h3>
                <p>{state.nextCity.note}</p>
                <span className="next-cta">
                  写下我们的下一站 <ChevronRight size={14} />
                </span>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Polaroid Archive Grid */}
      {(filter === 'all' || filter === 'polaroids') && (
        <section className="gallery-section">
          <div className="panel-head">
            <h2 className="serif-title">拍立得时光墙</h2>
            <span className="panel-tip">点开照片可以查看详情或补盖印章</span>
          </div>

          {allPolaroids.length === 0 ? (
            <div className="soft-panel empty-gallery-box">
              <ImageIcon size={28} className="muted-icon" />
              <p>还没有存入过拍立得照片，快在上方传第一张给 TA 吧</p>
            </div>
          ) : (
            <div className="polaroid-archive-grid">
              {allPolaroids.map((item) => (
                <button
                  key={item.id}
                  className="archive-polaroid-card"
                  onClick={() => setLightboxItem(item)}
                >
                  <div className="archive-img-wrap">
                    <img src={item.imageData} alt={item.caption} />
                    {(item.stamps || []).slice(-3).map((st) => (
                      <span
                        key={st.id}
                        className="ink-stamp mini"
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          transform: `translate(-50%, -50%) rotate(${st.rotate}deg)`,
                        }}
                      >
                        {st.label}
                      </span>
                    ))}
                  </div>
                  <div className="archive-card-meta">
                    <p className="serif-title">{item.caption}</p>
                    <span>
                      {state.partners[item.author]?.name} · {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div className="modal-backdrop" onClick={() => setLightboxItem(null)}>
          <div className="modal-card lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setLightboxItem(null)}
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            <div className="polaroid-frame drafting" style={{ marginTop: 10 }}>
              <div className="polaroid-media-wrap">
                <img
                  src={activeLightbox.imageData}
                  alt={activeLightbox.caption}
                  className="polaroid-img"
                  style={{ maxHeight: 360 }}
                />
                {(activeLightbox.stamps || []).map((st) => (
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
                <p className="polaroid-caption serif-title">{activeLightbox.caption}</p>
                <div className="polaroid-meta">
                  <span>来自 {state.partners[activeLightbox.author]?.name}</span>
                  <span>{formatDateTime(activeLightbox.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="stamp-bar" style={{ marginTop: 14 }}>
              <span className="stamp-bar-label">给这张回忆盖印章</span>
              <div className="stamp-buttons">
                {STAMPS.map((st) => (
                  <button
                    key={st.label}
                    className="stamp-btn"
                    onClick={() => onStamp(st, activeLightbox.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="danger-outline-btn"
              onClick={async () => {
                await onDeletePolaroid(activeLightbox.id);
                setLightboxItem(null);
              }}
            >
              <Trash2 size={14} /> 删除这张拍立得
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
