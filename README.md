# vaneEmy.github.io

Sitio personal de [Vanessa Emily](https://vanemy.me). 
Es un sitio [Jekyll](https://jekyllrb.com/) servido con GitHub Pages.

## Correr el sitio en local

```bash
./bin/serve.sh            # sirve el sitio en http://localhost:4000
./bin/serve.sh --drafts   # incluye también lo que está en _drafts/
```

Se recarga solo cada vez que guardas un cambio (`--livereload`). `Ctrl+C` para apagarlo.

La primera vez, si el script marca errores de que faltan gemas:

```bash
gem install --user-install bundler -v 2.4.22
bundle _2.4.22_ install
```

(El `Gemfile` ya pinea versiones compatibles.)

## Estructura

```
_layouts/, _includes/     # banner, sidebar, footer y el armazón de cada página
assets/css/style.css      # todo el CSS del sitio
assets/js/main.js         # todo el JS del sitio 
sobre/, laboratorio/,      cada sección vive en su propia carpeta con un index.html
redes/, visitas/, etc.
_posts/                   # memorias publicadas
_drafts/                  # memorias sin terminar (no aparecen en el sitio hasta moverlas a _posts/)
```

## Escribir una memoria nueva

1. Crear el archivo en `_drafts/nombre-lo-que-sea.md` con al menos:
   ```yaml
   ---
   title: "Título de la memoria"
   ---
   ```
2. Escribir el cuerpo en Markdown normal.
3. Cuando esté lista, muévela a `_posts/AAAA-MM-DD-nombre.md` (la fecha en el nombre es obligatoria).

### Tags

Se agregan así:
```yaml
tags: [reflexiones, corazón_abierto]
```
Aparecen como pastillas debajo del título. Al hacer click, la mayoría lleva a `/blog/tag/?t=...`, un listado automático de todo lo que comparte ese tag. Dos tags son especiales y en vez de eso llevan a su propia sección: `extranos-delirios-de-jengibre` y `corazon-entretejido`.

### Links estilo Obsidian

Dentro de una memoria puedes escribir:
- `[[Título de otra página o memoria]]` → se convierte en link real si ese título existe en el sitio.
- `[[Título::alias]]` → mismo link, pero mostrando "alias" como texto. **Usa `::`, no `|`** — kramdown convierte cualquier línea con `|` en una tabla, incluso sin querer.
- Si el título no existe todavía, se muestra subrayado punteado en vez de romperse (como Obsidian marca notas que faltan).

## Despliegue

`git push origin master` publica directo en vanemy.me (GitHub Pages reconstruye con Jekyll automáticamente, 1-2 minutos).
