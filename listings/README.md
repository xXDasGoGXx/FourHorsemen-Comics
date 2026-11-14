# eBay listing packages

Each folder here is one item for Matthew's eBay account (`abandcomics`). Claude writes it from the photos and
details Matthew sends; nothing in this folder is part of the website (only `site/` is published).

```
listings/
  defaults.json            shared settings: business policy IDs, ships-from, description footer
  <sku>/listing.json       one item (see below)
  <sku>/01.jpg, 02.jpg ... Matthew's own photos, front cover first (no stock or publisher images)
```

How it goes up (gateway HomeCommander-Claude, catalog v36):
1. Commit the folder to `main`.
2. `ebay-preview <sku> <commit>`: eBay's own dry run, shows the listing and fees. Nothing is listed.
3. Matthew says OK; `ebay-post <sku> <commit>` lists it (he approves in the app). Same sku + commit never lists twice.

The photo links are pinned to the commit, so a folder can be deleted later without breaking the listing (eBay keeps
its own copy of the photos anyway). Listings stay normal eBay listings: revise or end them in the eBay app.

## listing.json

```json
{
  "sku": "asm-129-cgc-6-0",
  "title": "Amazing Spider-Man #129 CGC 6.0 1974 1st Punisher & Jackal",
  "price": "1450.00",
  "quantity": 1,
  "category_id": "259104",
  "condition_id": "3000",
  "condition_description": "Spine stress, light corner wear; see photos.",
  "item_specifics": {"Publisher": "Marvel", "Series Title": "The Amazing Spider-Man", "Issue Number": "129"},
  "description": "Plain text. Blank line = new paragraph.",
  "photos": ["01.jpg", "02.jpg"],
  "best_offer": {"enabled": true, "auto_accept": "1400.00", "minimum": "1250.00"}
}
```

- `sku`: same as the folder name; lowercase letters, digits and dashes.
- `title`: up to 80 characters. `price`: 0.99 to 25,000. `quantity`: 1 to 10.
- `category_id`, `condition_id`, `condition_descriptors` (graded books) and `item_specifics`: look them up with
  `ebay-categories` and `ebay-category-info`; eBay's preview says if anything required is missing.
- `best_offer`: `false`, `true`, or amounts below the price.
- Optional per item: `shipping_policy`, `payment_policy`, `return_policy` (IDs from `ebay-account`), `location`,
  `postal_code`; otherwise `defaults.json` applies.
- Prices are Matthew's call, item by item. The website never shows them.
