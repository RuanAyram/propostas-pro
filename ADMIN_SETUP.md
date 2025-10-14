# Sistema de Administração - Stack Auth

Este documento explica como configurar e usar o sistema de administração para gerenciar usuários usando Stack Auth.

## 📋 Funcionalidades Implementadas

### ✅ Sistema de Roles
- **UserRole Model**: Tabela no banco para gerenciar roles (admin/user)
- **UserRoleManager**: Classe utilitária para gerenciar permissões
- **Verificação de Admin**: Hook personalizado para verificar status de admin

### ✅ APIs Criadas
- `GET /api/admin/check` - Verifica se usuário é admin
- `GET /api/admin/users` - Lista todos os usuários (apenas admins)
- `PATCH /api/admin/users/[userId]/role` - Altera role de usuário

### ✅ Interface de Administração
- **Página Admin**: `/admin` - Painel completo de administração
- **Tabela de Usuários**: Visualiza todos os usuários do Stack Auth
- **Gerenciamento de Roles**: Promover/rebaixar usuários
- **Estatísticas**: Contadores de usuários e admins

## 🚀 Como Configurar

### 1. Aplicar Migrações do Banco
```bash
# Aplicar as mudanças no schema do Prisma
npx prisma db push

# Ou criar uma migração
npx prisma migrate dev --name add-user-roles
```

### 2. Definir Primeiro Admin
Você precisa definir manualmente o primeiro usuário como admin:

```bash
# Usando o script criado
npx tsx scripts/set-admin.ts <USER_ID>

# Exemplo:
npx tsx scripts/set-admin.ts user_123456789
```

**Como obter o USER_ID:**
1. Faça login no seu app
2. Abra o console do navegador na página principal
3. Descomente a linha `console.log(user)` no arquivo `app/page.tsx`
4. O ID do usuário aparecerá no console

### 3. Adicionar Link de Admin (Opcional)
Para adicionar um link para o painel de admin na página principal, adicione estas linhas:

**No arquivo `app/page.tsx`:**
```typescript
// Adicionar import
import { useAdmin } from "@/hooks/use-admin"

// Dentro do componente
const { isAdmin } = useAdmin()

// No header, adicionar botão admin (após as configurações globais):
{isAdmin && (
  <Link href="/admin">
    <Button variant="outline" size="sm">
      <Shield className="mr-2 h-4 w-4" />
      Admin
    </Button>
  </Link>
)}
```

## 🎯 Como Usar

### Acessar Painel de Admin
1. Faça login como usuário admin
2. Acesse `/admin` diretamente na URL
3. Ou use o botão "Admin" se adicionado ao header

### Gerenciar Usuários
1. **Visualizar Usuários**: Todos os usuários do Stack Auth são listados
2. **Promover a Admin**: Clique em "Promover a Admin" 
3. **Remover Admin**: Clique em "Remover Admin"
4. **Proteções**: Admins não podem se rebaixar

### Informações Exibidas
- **Email**: Email principal do usuário
- **Nome**: Nome de exibição
- **Role**: Admin ou Usuário comum
- **Email Verificado**: Status de verificação
- **Data de Cadastro**: Quando o usuário se registrou

## 🔒 Segurança

### Proteções Implementadas
- ✅ **Autenticação Obrigatória**: Apenas usuários logados
- ✅ **Verificação de Admin**: Apenas admins podem acessar
- ✅ **Auto-proteção**: Admins não podem se rebaixar
- ✅ **Validação de API**: Todas as APIs verificam permissões
- ✅ **Tratamento de Erros**: Mensagens de erro apropriadas

### Fluxo de Autorização
1. **Usuário faz login** → Stack Auth autentica
2. **Sistema verifica role** → Consulta tabela `user_roles`
3. **Autoriza acesso** → Permite ou nega baseado no role

## 📊 Estrutura do Banco

### Tabela `user_roles`
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR UNIQUE NOT NULL, -- ID do Stack Auth
  role VARCHAR DEFAULT 'user',     -- 'admin' ou 'user'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Dados do Stack Auth
Os dados dos usuários ficam no Stack Auth (tabela `neon_auth.users_sync`), e apenas os roles ficam na nossa tabela local.

## 🛠️ Troubleshooting

### Problema: "Acesso Negado"
- **Causa**: Usuário não é admin
- **Solução**: Use o script para definir como admin

### Problema: "Erro ao buscar usuários"
- **Causa**: Problema na API do Stack Auth
- **Solução**: Verifique configuração do Stack Auth

### Problema: Usuário não aparece na lista
- **Causa**: Usuário pode não ter feito login ainda
- **Solução**: Usuário deve fazer login pelo menos uma vez

## 🔄 Próximos Passos

### Melhorias Possíveis
- [ ] **Roles Customizados**: Além de admin/user
- [ ] **Auditoria**: Log de mudanças de roles
- [ ] **Bulk Actions**: Ações em massa
- [ ] **Filtros**: Filtrar por role, status, etc.
- [ ] **Paginação**: Para muitos usuários

### Integração com Propostas
- [ ] **Propostas por Usuário**: Associar propostas aos usuários
- [ ] **Permissões Granulares**: Controle fino de acesso
- [ ] **Templates Privados**: Templates apenas para admins

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme que as migrações foram aplicadas
3. Verifique se o usuário foi definido como admin
4. Teste as APIs diretamente no navegador

---

**Implementado com ❤️ usando Stack Auth + Next.js + Prisma**
