# HTML Rules

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>Page Title | Tyler Chou Law for Creators</title>
  <meta name="description" content="">
  
  <!-- Open Graph -->
  <meta property="og:title" content="">
  <meta property="og:description" content="">
  <meta property="og:image" content="">
  <meta property="og:url" content="">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- Styles -->
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <!-- Content -->
  
  <!-- Scripts at end of body -->
  <script type="module" src="/scripts/main.js"></script>
</body>
</html>
```

---

## Semantic Structure

Use semantic HTML elements:

```html
<header class="header">
  <nav class="nav">...</nav>
</header>

<main class="main">
  <section class="section section--hero">...</section>
  <section class="section section--about">...</section>
</main>

<footer class="footer">...</footer>
```

### Section Pattern

```html
<section class="section section--[name]">
  <div class="container">
    <header class="section__header">
      <h2 class="section__title">...</h2>
      <p class="section__subtitle">...</p>
    </header>
    <div class="section__content">
      <!-- Content -->
    </div>
  </div>
</section>
```

---

## Accessibility Requirements

### Images

```html
<!-- Decorative -->
<img src="..." alt="" role="presentation">

<!-- Meaningful -->
<img src="..." alt="Tyler Chou speaking at Creator Summit 2024">
```

### Links

```html
<!-- External links -->
<a href="..." target="_blank" rel="noopener noreferrer">
  Link text
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- Icon-only links need labels -->
<a href="..." aria-label="Follow on Instagram">
  <svg>...</svg>
</a>
```

### Interactive Elements

```html
<!-- Buttons for actions -->
<button type="button" class="btn">Click me</button>

<!-- Links for navigation -->
<a href="/about" class="link">About</a>
```

### Screen Reader Utilities

```html
<!-- Visually hidden but accessible -->
<span class="sr-only">Description for screen readers</span>
```

---

## Animation Data Attributes

Use data attributes for JS-driven animations:

```html
<!-- Basic fade up -->
<div data-animate="fade-up">...</div>

<!-- With delay -->
<div data-animate="fade-up" data-delay="0.2">...</div>

<!-- Stagger children -->
<ul data-animate="stagger">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

---

## Netlify Forms

```html
<form 
  name="contact" 
  method="POST" 
  data-netlify="true" 
  netlify-honeypot="bot-field"
>
  <!-- Honeypot for spam -->
  <p class="hidden">
    <label>Don't fill this out: <input name="bot-field"></label>
  </p>
  
  <!-- Form fields -->
  <div class="form__field">
    <label for="name" class="form__label">Name</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      class="form__input"
      required
    >
  </div>
  
  <button type="submit" class="btn btn--primary">Send</button>
</form>
```

---

## Forbidden Patterns

- ❌ Inline styles (`style=""`)
- ❌ Inline event handlers (`onclick=""`)
- ❌ Deprecated elements (`<center>`, `<font>`, etc.)
- ❌ Missing `alt` attributes on images
- ❌ Empty links or buttons
- ❌ Non-semantic div soup (use `section`, `article`, `nav`, etc.)
- ❌ IDs for styling (reserve for JS hooks and anchors)
