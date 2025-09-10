# Configuração do Neon DB

## Passos para configurar o banco de dados Neon

### 1. Criar conta no Neon
1. Acesse [https://neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Obter a string de conexão
1. No dashboard do Neon, vá para a seção "Connection Details"
2. Copie a string de conexão PostgreSQL
3. Ela deve ter o formato: `postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### 3. Configurar variáveis de ambiente
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione a string de conexão:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. Executar migrações
```bash
# Fazer push do schema para o banco
npm run db:push

# Executar seed para popular com dados iniciais
npm run db:seed
```

### 5. Para Vercel
1. No dashboard da Vercel, vá para Settings > Environment Variables
2. Adicione a variável `DATABASE_URL` com a string de conexão do Neon
3. Faça o deploy da aplicação

## Comandos úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Fazer push do schema
npm run db:push

# Abrir Prisma Studio
npm run db:studio

# Executar seed
npm run db:seed
```
