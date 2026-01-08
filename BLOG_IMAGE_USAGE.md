# Blog Image Component Usage

CSS-based image treatment system for blog post images. Abstracts images into textural, non-literal visual elements.

## HTML Structure

### Basic Usage

```html
<!-- External URL (Unsplash, Wikimedia, etc.) -->
<div class="blog-image" data-color="chuparosa-500">
  <img 
    src="https://images.unsplash.com/photo-1234567890" 
    alt="Description" 
    class="blog-image__img"
    loading="lazy"
  />
</div>

<!-- Local Upload via Decap CMS -->
<div class="blog-image" data-color="lupine-600">
  <img 
    src="/src/assets/images/blog/my-image.jpg" 
    alt="Description" 
    class="blog-image__img"
    loading="lazy"
  />
</div>
```

## Color Options

Use `data-color` attribute to apply color treatment. Available options:

### Chuparosa (Red)
- `chuparosa` or `chuparosa-500` (default)
- `chuparosa-400`
- `chuparosa-600`
- `chuparosa-700`

### Lupine (Purple)
- `lupine` or `lupine-500`
- `lupine-400`
- `lupine-600`
- `lupine-700`

### Palo Verde (Green)
- `palo-verde` or `palo-verde-500`
- `palo-verde-400`
- `palo-verde-600`
- `palo-verde-700`

### Desert Gold (Yellow/Gold)
- `desert-gold` or `desert-gold-500`
- `desert-gold-400`
- `desert-gold-600`
- `desert-gold-700`

### Neutral
- `obsidian` (black)
- `bone` (off-white)

## Intensity Modifiers

Add modifier class for abstraction level:

### Subtle (Image still readable)
```html
<div class="blog-image blog-image--subtle" data-color="chuparosa-500">
  <img src="..." alt="..." class="blog-image__img" />
</div>
```

### Heavy (Fully abstract, textural)
```html
<div class="blog-image blog-image--heavy" data-color="lupine-600">
  <img src="..." alt="..." class="blog-image__img" />
</div>
```

### Default (Medium abstraction)
```html
<div class="blog-image" data-color="desert-gold-500">
  <img src="..." alt="..." class="blog-image__img" />
</div>
```

## Complete Examples

### Blog Card Image
```html
<article class="blog-card">
  <a href="/love-letters/post.html" class="blog-card__link">
    <div class="blog-card__image-wrapper">
      <div class="blog-image" data-color="chuparosa-500">
        <img 
          src="/src/assets/images/blog/featured-image.jpg" 
          alt="Post title" 
          class="blog-image__img"
          loading="lazy"
        />
      </div>
    </div>
    <div class="blog-card__content">
      <!-- Card content -->
    </div>
  </a>
</article>
```

### Blog Post Hero Image
```html
<section class="hero hero--inner-page">
  <div class="background-image" aria-hidden="true">
    <div class="blog-image blog-image--heavy" data-color="lupine-700">
      <img 
        src="https://images.unsplash.com/photo-1234567890" 
        alt="" 
        class="blog-image__img"
        loading="eager"
        fetchpriority="high"
      />
    </div>
    <!-- Overlay layers -->
  </div>
  <!-- Hero content -->
</section>
```

## Decap CMS Integration

The component works with Decap CMS fields:

- **Featured Image**: Upload or enter external URL
- **Image Treatment Color**: Select from dropdown (maps to `data-color`)
- **Image Treatment Intensity**: Select subtle, heavy, or default (maps to modifier class)

The build script will automatically apply these attributes when generating blog posts.

