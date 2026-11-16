import { Heart, Sun, Moon, Coffee, Flame, ShieldCheck, Phone } from 'lucide-react';

export const PULSE_ACTIONS = [
  { key: 'miss', emoji: '💗', label: '想你了' },
  { key: 'hug', emoji: '🫂', label: '抱抱' },
  { key: 'kiss', emoji: '💋', label: '亲一口' },
  { key: 'pat', emoji: '✨', label: '摸摸头' },
];

export const MOODS = [
  { key: 'sunny', emoji: '☀️', label: '元气', full: '元气满满', icon: Sun },
  { key: 'miss', emoji: '💗', label: '想你', full: '正在想你', icon: Heart },
  { key: 'hug', emoji: '🫂', label: '求抱', full: '想被抱紧', icon: Flame },
  { key: 'food', emoji: '🍜', label: '干饭', full: '好好吃饭', icon: Coffee },
  { key: 'sleep', emoji: '🌙', label: '晚安', full: '准备睡啦', icon: Moon },
];

export const STAMPS = [
  { emoji: '♡', label: '可爱满分' },
  { emoji: '✦', label: '超级想你' },
  { emoji: '✈', label: '想飞奔见你' },
  { emoji: '✿', label: '下次一起吃' },
];

export const COUPON_ICONS = {
  hug: Heart,
  peace: ShieldCheck,
  milk_tea: Coffee,
  call: Phone,
};

export const ANGER_LEVELS = [
  { level: 0, label: '晴天平静', short: '平静 0%', desc: '心情很好' },
  { level: 35, label: '有点委屈', short: '委屈 35%', desc: '需要顺顺毛' },
  { level: 70, label: '气鼓鼓中', short: '生气 70%', desc: '快点来哄我' },
  { level: 100, label: '先冷静下', short: '火山 100%', desc: '怕说错话先暂停' },
];

export const SOOTHE_ACTIONS = [
  { key: 'sorry', label: '诚恳认错，我先低头' },
  { key: 'hug', label: '申请无条件抱抱' },
  { key: 'tea', label: '投喂小甜水消消气' },
  { key: 'listen', label: '闭麦，认真听你说' },
];

export function diffDaysFromToday(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRelativeTime(ts) {
  if (!ts) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 15) return '刚刚';
  if (diffSec < 60) return `${diffSec} 秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  return `${Math.floor(diffHr / 24)} 天前`;
}

export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m}-${day} ${hh}:${mm}`;
}
