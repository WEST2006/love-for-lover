import { createClient } from '@supabase/supabase-js';

let client = null;
let activeChannel = null;

export function isSupabaseRealtimeEnabled() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getRealtimeClient() {
  if (client) return client;
  client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  return client;
}

export function subscribeRealtime({ role, onPresence, onEvent }) {
  if (!isSupabaseRealtimeEnabled()) return () => {};

  const sb = getRealtimeClient();
  const channel = sb.channel('love-space-room', {
    config: {
      broadcast: { self: false },
      presence: { key: role || 'guest' },
    },
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    onPresence({
      him: Boolean(state.him && state.him.length > 0),
      her: Boolean(state.her && state.her.length > 0),
    });
  });

  channel.on('broadcast', { event: 'love_event' }, ({ payload }) => {
    if (payload?.eventName) {
      onEvent(payload.eventName, payload);
    }
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED' && (role === 'him' || role === 'her')) {
      try {
        await channel.track({ role, onlineAt: Date.now() });
      } catch {
        // ignore presence track error
      }
    }
  });

  activeChannel = channel;

  return () => {
    if (activeChannel === channel) activeChannel = null;
    sb.removeChannel(channel);
  };
}

export async function emitRealtime(eventName, payload = {}) {
  if (!isSupabaseRealtimeEnabled() || !activeChannel) return;
  try {
    await activeChannel.send({
      type: 'broadcast',
      event: 'love_event',
      payload: {
        eventName,
        ...payload,
        ts: Date.now(),
      },
    });
  } catch {
    // ignore transient broadcast error
  }
}
