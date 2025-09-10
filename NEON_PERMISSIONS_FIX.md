# 🔧 Solução para Erro de Permissões no Neon DB

## ❌ Erro Encontrado
```
ERROR: permission denied for schema public
```

## 🔍 Causa do Problema
O Neon DB às vezes tem restrições de permissão no schema `public` para novos usuários ou projetos.

## ✅ Soluções

### Solução 1: Verificar String de Conexão
Certifique-se de que sua string de conexão está correta e inclui todas as permissões necessárias:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Solução 2: Usar Connection Pooling (Recomendado)
O Neon funciona melhor com connection pooling. Atualize sua string de conexão:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
```

### Solução 3: Verificar Permissões no Dashboard do Neon
1. Acesse o dashboard do Neon
2. Vá para "Settings" > "Roles"
3. Certifique-se de que o usuário tem permissões de `CREATE` e `USAGE` no schema `public`

### Solução 4: Executar Comandos SQL Manualmente
Se o problema persistir, execute estes comandos no SQL Editor do Neon:

```sql
-- Conceder permissões ao usuário atual
GRANT CREATE ON SCHEMA public TO CURRENT_USER;
GRANT USAGE ON SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;

-- Para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO CURRENT_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO CURRENT_USER;
```

### Solução 5: Usar Prisma Migrate em vez de db push
Em vez de `db push`, use migrações:

```bash
# Gerar migração inicial
npx prisma migrate dev --name init

# Aplicar migrações
npx prisma migrate deploy
```

## 🚀 Comandos para Testar

```bash
# 1. Regenerar cliente Prisma
npx prisma generate

# 2. Tentar push do schema
npm run db:push

# 3. Se falhar, tentar com migrate
npx prisma migrate dev --name init

# 4. Executar seed
npm run db:seed
```

## 🔄 Alternativa: Schema Personalizado
Se o problema persistir, podemos criar um schema personalizado:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["proposal_generator"]
}

model Template {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  content     String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("templates")
  @@schema("proposal_generator")
}
```

## 📞 Suporte
Se nenhuma solução funcionar:
1. Verifique a documentação do Neon: https://neon.tech/docs
2. Entre em contato com o suporte do Neon
3. Considere criar um novo projeto no Neon
