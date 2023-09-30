### HSL Colors

Quick and simple HSL color highlighter for tailwind configs.
Supported HSL format: `xxx yy% zz%`

### Example usage

styles.css
```css
@layer base {
  :root {
    --color-primary: 234 40% 18%;
    --color-secondary: 422 40% 18%;
  }
}
```

tailwind.config.js
```js
theme: {
  colors: {
    primary: "hsl(var(--color-content-ghost) / <alpha-value>)",
    secondary: "hsl(var(--color-content-link) / <alpha-value>)",
  }
}
```