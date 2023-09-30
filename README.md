### HSL Colors

Quick and simple HSL color highlighter for tailwind configs.
Supported HSL format: `xxx yy% zz%`

### Example usage

styles.css
```css
@layer base {
  :root {
    /* colors here will be highlighted */
    --color-primary: 234 40% 18%;
    --color-secondary: 422 40% 18%;
  }
}
```

tailwind.config.js
```js
theme: {
  colors: {
    primary: "hsl(var(--color-primary) / <alpha-value>)",
    secondary: "hsl(var(--color-secondary) / <alpha-value>)",
  }
}
```

### Setup

I will not publish this extension, so to use you need to follow the steps bellow:

- Clone/download repo
- Use `vsce` command to build
  - Don't have it? `npm install -g @vscode/vsce`
- Run command `vsce package`
- Go to vscode add select 'install from VSIX'
