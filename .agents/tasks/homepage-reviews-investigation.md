# Homepage Reviews Investigation Report
**Question:** Why are reviews/comments (التعليقات) not showing on the homepage?

---

## Summary Answer

**Root cause: The homepage fetches from the wrong API endpoint.**

`app/page.tsx` calls `GET /api/admin/reviews` directly on the backend. That endpoint **filters by `approved: true`** and returns a **paginated object** (`{ reviews, total, page, pages }`), not a plain array. The homepage then does:

```ts
return Array.isArray(data) ? data : [];
```

Because the response is an object (not an array), this check always returns `[]` — **an empty array every time** — so no reviews are ever passed to `<CustomerReviews>`.

There is also a secondary problem: even if `approved` reviews exist, any review submitted by a user through the "شارك تجربتك" form defaults to `approved: false` in the DB and will never appear until an admin manually toggles it. But the shape mismatch is the immediate bug that blocks all reviews, including ones an admin explicitly approved.

---

## Evidence

### 1. Homepage fetch — wrong endpoint, wrong response shape

**File:** `frontend/app/page.tsx` (lines 12–22)

```ts
async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/reviews`, {  // ← calls backend directly
      next: { revalidate: 3600, tags: ["reviews"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];  // ← BUG: data is { reviews, total, page, pages }
  } catch {
    return [];
  }
}
```

### 2. Backend route response shape — paginated object, not array

**File:** `backend/routes/adminRoutes.js` (lines 846–860)

```js
// GET /api/admin/reviews (public - approved only, paginated)
router.get("/reviews", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ approved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ approved: true }),
    ]);
    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
    //        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //        Returns an OBJECT, not an array
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});
```

`Array.isArray({ reviews: [...], total: 5, page: 1, pages: 1 })` → **false** → returns `[]`.

### 3. `approved` field defaults to `false`

**File:** `backend/models/Review.js`

```js
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  gender: { type: String, enum: ["male", "female"], default: "male" },
  approved: { type: Boolean, default: false },  // ← false by default
}, { timestamps: true });
```

All user-submitted reviews start hidden. An admin must toggle them to `approved: true` in `/admin/reviews` before they can appear — even once the shape bug is fixed.

### 4. There is a correct frontend API route (`/api/reviews`) — but it's not used server-side

**File:** `frontend/app/api/reviews/route.ts`

```ts
export async function GET() {
  const res = await fetch(`${getBackend()}/api/admin/reviews`, {
    next: { revalidate: 3600, tags: ["reviews"] },
  });
  const data = await res.json();
  return NextResponse.json(data, { ... });
}
```

This route proxies the same backend endpoint and has the **same shape problem** — it forwards the paginated object as-is. However, `CustomerReviews.tsx` (client component) calls it in a fallback:

```ts
useEffect(() => {
  if (initialReviews.length > 0) return;  // ← skipped if server already passed data
  fetch("/api/reviews")
    .then((r) => r.json())
    .then((data) => Array.isArray(data) && setReviews(data))  // ← same bug: object ≠ array
    .catch(() => {});
}, [initialReviews.length]);
```

So **both the server-side fetch and the client-side fallback** silently return empty due to the same `Array.isArray` check against a paginated object.

### 5. Admin page handles the paginated shape correctly — but homepage doesn't

**File:** `frontend/app/admin/reviews/page.tsx` (lines ~112–116)

```ts
.then((data) => {
  if (Array.isArray(data)) setReviews(data);
  else if (data?.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
  //                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                         Admin page correctly unwraps data.reviews
})
```

The admin page handles both shapes. The homepage `getReviews()` function and the `CustomerReviews` fallback fetch do not.

---

## Conclusions

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | `getReviews()` does `Array.isArray(data) ? data : []` but backend returns `{ reviews, total, ... }` — always returns `[]` | **Critical** | `app/page.tsx` |
| 2 | Client-side fallback in `CustomerReviews` has the same `Array.isArray` check on the same shape | **Critical** | `app/components/CustomerReviews.tsx` |
| 3 | Frontend `/api/reviews` proxy also forwards the paginated object without unwrapping | **High** | `app/api/reviews/route.ts` |
| 4 | Reviews default to `approved: false` — must be manually approved by admin before they show | **Medium** (by design) | `backend/models/Review.js` |

---

## Recommended Fixes

### Fix 1 — Unwrap `data.reviews` in `app/page.tsx` (primary fix)

```ts
async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${BACKEND}/api/admin/reviews`, {
      next: { revalidate: 3600, tags: ["reviews"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Backend returns { reviews: [...], total, page, pages }
    if (Array.isArray(data)) return data;                          // backwards compat
    if (Array.isArray(data?.reviews)) return data.reviews;         // ← correct unwrap
    return [];
  } catch {
    return [];
  }
}
```

### Fix 2 — Fix the same issue in `app/api/reviews/route.ts`

```ts
export async function GET() {
  const res = await fetch(`${getBackend()}/api/admin/reviews`, {
    next: { revalidate: 3600, tags: ["reviews"] },
  });
  const data = await res.json();
  // Unwrap paginated shape to plain array for the client component
  const reviews = Array.isArray(data) ? data : (data?.reviews ?? []);
  return NextResponse.json(reviews, {
    status: res.status,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
```

### Fix 3 — Fix the fallback in `CustomerReviews.tsx`

```ts
useEffect(() => {
  if (initialReviews.length > 0) return;
  fetch("/api/reviews")
    .then((r) => r.json())
    .then((data) => {
      const arr = Array.isArray(data) ? data : (data?.reviews ?? []);
      if (arr.length > 0) setReviews(arr);
    })
    .catch(() => {});
}, [initialReviews.length]);
```

### Reminder — Approve reviews in admin panel

After fixing the shape bug, only reviews with `approved: true` will appear. Go to `/admin/reviews` and toggle the switch next to each review to make it visible on the homepage.

---

*Investigation performed: read-only, no code was modified.*
