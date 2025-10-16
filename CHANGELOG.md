# Changelog - Sistema de Documentos

## Versão 2.0.0 - Navegação Multi-Área e Templates por Usuário

### 🎯 Funcionalidades Principais

#### 1. **CRUD de Templates por Usuário**
- Templates agora são vinculados ao `userId` do usuário logado
- Cada usuário tem seus próprios templates isolados
- Schema Prisma atualizado com campo `userId` e índice único composto `[userId, name]`

#### 2. **Sistema de Navegação com 3 Áreas**
- **Navbar** com navegação entre as áreas principais
- **3 Páginas Distintas:**
  - `/` - Propostas Comerciais
  - `/contratos` - Contratos
  - `/recebimentos` - Recebimentos

### 📁 Arquivos Criados

#### Componentes
- `components/main-nav.tsx` - Navbar com navegação entre as 3 áreas
- `components/document-layout.tsx` - Layout compartilhado com header, navbar e configurações globais

#### Páginas
- `app/contratos/page.tsx` - Página de geração de contratos
- `app/recebimentos/page.tsx` - Página de geração de recibos

### 🔧 Arquivos Modificados

#### Schema e Banco de Dados
- `prisma/schema.prisma` - Adicionado campo `userId` ao modelo `Template`
  - Campo obrigatório `userId` (String)
  - Índice único composto `[userId, name]`
  - Índice em `userId` para performance

#### APIs
- `app/api/templates/route.ts`
  - GET: Requer `userId` como query parameter
  - POST: Requer `userId` no body
  - Filtragem de templates por usuário

- `app/api/templates/[id]/route.ts`
  - PUT: Valida se template pertence ao usuário antes de atualizar
  - DELETE: Valida se template pertence ao usuário antes de deletar
  - Retorna 403 (Unauthorized) se usuário tentar modificar template de outro

#### Componentes
- `components/config-tab.tsx` - Atualizado para incluir `userId` nas chamadas de API
- `components/rich-text-editor.tsx` - Atualizado para incluir `userId` nas chamadas de API
- `app/page.tsx` - Refatorado para usar `DocumentLayout`

### 🗄️ Migrações de Banco de Dados

```bash
npx prisma db push
```

**Atenção:** Esta migração resetou o banco de dados pois o campo `userId` foi adicionado como obrigatório em uma tabela com dados existentes.

### 🎨 Funcionalidades das Novas Páginas

#### Contratos (`/contratos`)
- Formulário para dados do contratante e contratado
- Campos para objeto, valor, prazo e cláusulas
- Preview do contrato formatado
- Botão para download em PDF (a implementar)

#### Recebimentos (`/recebimentos`)
- Formulário para dados do emitente e pagador
- Campos para valor, valor por extenso, referente e forma de pagamento
- Preview do recibo formatado
- Botão para download em PDF (a implementar)

### 🔐 Segurança

- **Isolamento de Dados:** Cada usuário só pode ver e manipular seus próprios templates
- **Validação de Propriedade:** APIs validam se o usuário é dono do template antes de permitir edição/exclusão
- **Autenticação Obrigatória:** Todas as operações requerem usuário autenticado

### 📋 Próximos Passos (TODO)

1. Implementar geração de PDF para contratos
2. Implementar geração de PDF para recibos
3. Adicionar sistema de templates para contratos e recibos
4. Implementar salvamento de rascunhos
5. Adicionar histórico de documentos gerados

### 🚀 Como Usar

1. **Fazer login** no sistema
2. **Navegar** entre as áreas usando a navbar no topo
3. **Criar templates** personalizados em cada área
4. **Gerar documentos** preenchendo os formulários
5. **Visualizar** o preview antes de baixar

### ⚠️ Breaking Changes

- **Templates existentes foram perdidos** devido ao reset do banco de dados
- **API de templates agora requer `userId`** em todas as operações
- **Componentes que usam templates** precisam passar o `userId` do usuário logado

### 🐛 Problemas Conhecidos

- Erros de TypeScript temporários até que o Prisma Client seja regenerado completamente
- Necessário reiniciar o servidor de desenvolvimento após aplicar as migrações

### 📝 Notas Técnicas

- Layout compartilhado reduz duplicação de código
- Navbar responsiva com ícones e labels
- Todas as páginas seguem o mesmo padrão de UI/UX
- Sistema preparado para expansão futura
