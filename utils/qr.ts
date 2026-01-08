import * as Linking from 'expo-linking';

export type FleetQrEntityType = 'machinery' | 'location' | 'balestack' | 'jobcard';
export type FleetQrAction = 'open' | 'daily_check';

export interface FleetQrPayload {
  type: FleetQrEntityType;
  id: string;
  action?: FleetQrAction;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildFleetQrUrl(payload: FleetQrPayload): string {
  const queryParams: Record<string, string> = {
    type: payload.type,
    id: payload.id,
  };
  if (payload.action) queryParams.action = payload.action;

  const url = Linking.createURL('/qr', { queryParams });
  console.log('[QR] buildFleetQrUrl', { payload, url });
  return url;
}

export function getQrImageUrl(data: string, size: number = 320): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export function parseFleetQr(text: string): FleetQrPayload | null {
  const raw = text.trim();
  if (!raw) return null;

  // Supported:
  // 1) Any URL containing /qr?type=..&id=..
  // 2) Any URL containing ?type=..&id=..
  // 3) Raw format: fleet:type:id[:action]

  if (raw.startsWith('fleet:')) {
    const parts = raw.split(':').filter(Boolean);
    const type = parts[1] as FleetQrEntityType | undefined;
    const id = parts[2];
    const action = parts[3] as FleetQrAction | undefined;
    if (!type || !id) return null;
    if (!['machinery', 'location', 'balestack', 'jobcard'].includes(type)) return null;
    if (action && !['open', 'daily_check'].includes(action)) return null;
    return { type, id, action };
  }

  try {
    const url = new URL(raw);
    const params = url.searchParams;

    const type = (params.get('type') ?? '') as FleetQrEntityType;
    const id = params.get('id') ?? '';
    const action = (params.get('action') ?? undefined) as FleetQrAction | undefined;

    if (!type || !id) {
      return null;
    }

    const normalizedType = safeDecodeURIComponent(type) as FleetQrEntityType;
    const normalizedId = safeDecodeURIComponent(id);
    const normalizedAction = action ? (safeDecodeURIComponent(action) as FleetQrAction) : undefined;

    if (!['machinery', 'location', 'balestack', 'jobcard'].includes(normalizedType)) return null;
    if (normalizedAction && !['open', 'daily_check'].includes(normalizedAction)) return null;

    return { type: normalizedType, id: normalizedId, action: normalizedAction };
  } catch (e) {
    console.log('[QR] parseFleetQr not a URL', { raw, e });
  }

  return null;
}

export function getRouteForQr(payload: FleetQrPayload): string {
  switch (payload.type) {
    case 'machinery':
      return `/machinery/${payload.id}`;
    case 'location':
      return `/location/${payload.id}`;
    case 'balestack':
      return `/balestack/${payload.id}`;
    case 'jobcard':
      return `/jobcard/${payload.id}`;
    default:
      return '/(tabs)';
  }
}
