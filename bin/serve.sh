#!/bin/sh
# Levanta el sitio en local: http://localhost:4000
# Uso: ./bin/serve.sh          → sirve el sitio normal
#      ./bin/serve.sh --drafts → incluye los borradores de _drafts/

export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/2.6.0"

cd "$(dirname "$0")/.."
bundle _2.4.22_ exec jekyll serve --livereload "$@"
