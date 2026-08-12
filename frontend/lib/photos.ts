/**
 * High quality curated Unsplash photo pool for Stayly listings.
 * 20 distinct interior & exterior architecture photos ensuring no two listings share the same cover image.
 */

export const DISTINCT_PHOTO_POOL: string[] = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", // 1. Modern living room
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", // 2. Bright apartment
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", // 3. Cozy studio
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80", // 4. Luxury villa
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", // 5. Beach house pool
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80", // 6. Bedroom suite
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", // 7. Kitchen & dining
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80", // 8. Modern apartment interior
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", // 9. Modern villa exterior
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // 10. House with garden
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", // 11. Luxury living room
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80", // 12. Minimalist room
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", // 13. Resort stay
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80", // 14. Suburban home
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80", // 15. Villa with lawn
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80", // 16. Mountain cabin
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", // 17. Hotel suite
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", // 18. Japandi interior
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80", // 19. Warm living space
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", // 20. Pool villa terrace
];

export function getListingPhotos(listingId: number, coverPhotoUrl?: string | null): string[] {
  // If backend provided cover photo, place it first
  const baseIndex = (listingId - 1) % DISTINCT_PHOTO_POOL.length;
  const cover = coverPhotoUrl || DISTINCT_PHOTO_POOL[baseIndex];

  const p1 = DISTINCT_PHOTO_POOL[baseIndex];
  const p2 = DISTINCT_PHOTO_POOL[(baseIndex + 1) % DISTINCT_PHOTO_POOL.length];
  const p3 = DISTINCT_PHOTO_POOL[(baseIndex + 2) % DISTINCT_PHOTO_POOL.length];
  const p4 = DISTINCT_PHOTO_POOL[(baseIndex + 3) % DISTINCT_PHOTO_POOL.length];

  // Return 4 distinct photos with cover first
  const set = new Set([cover, p1, p2, p3, p4]);
  return Array.from(set).slice(0, 4);
}
