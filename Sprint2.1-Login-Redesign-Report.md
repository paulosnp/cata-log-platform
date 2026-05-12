# Sprint 2.1 — Login Redesign: Relatorio de Conclusao

> **Modulo**: Mobile do Artesao — Cata Log  
> **Data**: 12/05/2026  
> **Status**: Concluida

---

## 1. Objetivo

Revitalizar o design da tela de login, removendo o botao de login com Google (funcionalidade inexistente no sistema) e elevando a qualidade visual para um nivel premium.

---

## 2. O que foi Removido

| Elemento | Motivo |
|---|---|
| Botao "Continuar com Google" | Nao existe OAuth Google no sistema |
| Divisor "— ou —" | Sem necessidade sem o botao Google |
| Metodo `_buildGoogleButton()` | Dead code removido |

---

## 3. O que foi Adicionado / Alterado

### 3.1 Layout

| Antes | Depois |
|---|---|
| Logo + campos soltos no fundo | Logo em card com sombra suave + formulario em card elevado |
| Campos diretamente no body | Campos dentro de um card branco com bordas arredondadas |
| "Nao tem uma conta?" inline | Pill-shaped CTA com borda sutil ("Novo por aqui? Crie sua conta") |

### 3.2 Animacoes

| Elemento | Animacao |
|---|---|
| Logo | ScaleTransition (elasticOut 0.8→1.0) + FadeTransition |
| Card do formulario | FadeTransition + SlideTransition (staggered timing) |
| Navegacao para Registro | SlideTransition lateral (direita→esquerda) |
| Botao Entrar | Icone seta (arrow_forward) junto ao texto |

### 3.3 Inputs

| Antes | Depois |
|---|---|
| Sem FocusNode | FocusNode em ambos os campos — Enter no email foca na senha, Enter na senha faz login |
| Input sem fill | Inputs com fill sutil + borda que muda de cor no focus (primary) |
| Estilo generico | Filled inputs com `fillColor` translucido e `focusedBorder` colorido |

### 3.4 Background

| Antes | Depois |
|---|---|
| `subtleGradient` (2 cores) | Gradient diagonal com 3 stops (background → surfaceContainerLow → surfaceContainer) |

### 3.5 Outros

- SnackBar de erro agora com icone dentro de container com background translucido
- Footer links com mais espacamento (spacing: 24) e opacidade reduzida
- Texto do titulo mudou de "Bem-vindo, artesao" para "Bem-vindo de volta"
- Subtitulo simplificado para "Acesse sua vitrine e gerencie suas criacoes artesanais"

---

## 4. Ficheiros Alterados

| Ficheiro | Acao |
|---|---|
| `lib/screens/login_screen.dart` | Reescrito — novo layout, animacoes, removido Google login |

---

## 5. Validacao

| Check | Resultado |
|---|---|
| `flutter analyze` | No issues found! |
| Login funcional | Mantido intacto — AuthProvider inalterado |
| Navegacao Login → Registro | Funcional com slide transition |
| Navegacao Login → Dashboard | Funcional com fade transition |
| Keyboard flow | Email → Enter → foca Senha → Enter → Login |
