# 🛡️ Sistema de Administração - Guia Rápido

## ⚡ Configuração Rápida

### 1. Aplicar Schema do Banco
```bash
npx prisma db push
```

### 2. Definir Primeiro Admin
```bash
# Opção 1: Usando TypeScript (tsx)
npm run admin:set <SEU_USER_ID>

# Opção 2: Usando Node.js puro (se tsx não funcionar)
npm run admin:set-js <SEU_USER_ID>

# Exemplo:
npm run admin:set 4a3a7d9d-8bb2-4ded-a2cb-1888b82ddedd
```

### 3. Acessar Painel Admin
- URL: `http://localhost:3000/admin`
- Apenas usuários admin podem acessar

## 🔍 Como Obter seu USER_ID

1. **Faça login** no seu app
2. **Abra o console** do navegador (F12)
3. **Descomente** a linha no `app/page.tsx`:
   ```typescript
   // console.log(user); // ← Remover as barras
   console.log(user);   // ← Deve ficar assim
   ```
4. **Recarregue** a página
5. **Copie o ID** que aparece no console (algo como `user_123456789`)

## 🎯 Funcionalidades

### ✅ O que você pode fazer:
- **Ver todos os usuários** cadastrados
- **Promover usuários** para admin
- **Remover privilégios** de admin
- **Ver estatísticas** do sistema

### 🔒 Proteções:
- Apenas admins podem acessar `/admin`
- Admins não podem se rebaixar
- Todas as ações são validadas

## 📊 Dados Exibidos

Para cada usuário você verá:
- 📧 **Email** (do Stack Auth)
- 👤 **Nome** (se configurado)
- 🏷️ **Role** (Admin/Usuário)
- ✅ **Email Verificado** (sim/não)
- 📅 **Data de Cadastro**

## 🚨 Troubleshooting

### "Acesso Negado"
- Verifique se você foi definido como admin
- Execute: `npm run admin:set <SEU_USER_ID>` ou `npm run admin:set-js <SEU_USER_ID>`

### "Erro ao buscar usuários"
- Verifique se o banco está rodando
- Confirme que aplicou o schema: `npx prisma db push`

### Usuário não aparece
- Usuário precisa ter feito login pelo menos uma vez
- Dados vêm do Stack Auth automaticamente

## 🔄 Comandos Úteis

```bash
# Ver banco de dados
npx prisma studio

# Resetar banco (cuidado!)
npx prisma db push --force-reset

# Ver logs do servidor
npm run dev
```

---

**🎉 Pronto! Agora você tem controle total sobre os usuários do seu sistema.**
