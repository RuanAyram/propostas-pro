# Gerador de Propostas Comerciais Online

Uma aplicação web moderna e profissional para criação, edição e gerenciamento de propostas comerciais com editor de texto rico, sistema de templates e exportação para PDF.

## 🚀 Funcionalidades

### ✨ Principais Recursos

- **Editor de Texto Rico**: Editor completo com formatação de texto, títulos, listas, links, imagens e cores
- **Sistema de Templates**: Salve e reutilize templates de propostas com Neon DB
- **Preview A4**: Visualização em tempo real no formato A4 com zoom ajustável
- **Exportação PDF**: Gere PDFs profissionais mantendo toda a formatação
- **Compartilhamento**: Crie links para visualização das propostas
- **Gerenciamento de Dados**: Formulários para contratante e contratado com validação
- **Upload de Logos**: Suporte para logos das empresas
- **Design Responsivo**: Interface moderna e responsiva
- **Rate Limiting**: Proteção contra abuso com limite de 30 requisições/minuto
- **Segurança**: Validação de dados e sanitização de entrada

### 📋 Seções de Configuração

1. **Contratante**: Nome/Empresa, CNPJ/CPF, Endereço, Contato, Logo
2. **Contratado**: Dados completos da empresa contratada
3. **Proposta**: Editor rico para conteúdo da proposta com templates

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Banco de Dados**: Neon DB (PostgreSQL) com Prisma ORM
- **Editor**: ContentEditable API com toolbar customizada
- **PDF**: html2pdf.js para exportação
- **Validação**: Zod para validação de formulários
- **UI Components**: Radix UI primitives

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <repository-url>
cd gerador-propostas-comerciais
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. **Configure o banco de dados**
\`\`\`bash
# 1. Crie uma conta no Neon (https://neon.tech)
# 2. Crie um novo projeto
# 3. Copie a string de conexão PostgreSQL
# 4. Crie um arquivo .env na raiz do projeto:
echo "DATABASE_URL=\"postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true\"" > .env

# 5. Execute as migrações
npm run db:push
npm run db:seed
\`\`\`

4. **Execute o projeto**
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

5. **Acesse a aplicação**
\`\`\`
http://localhost:3000
\`\`\`

## 🎯 Como Usar

### 1. Configuração Inicial

1. **Aba Configuração**: Preencha os dados do contratante e contratado
2. **Upload de Logos**: Adicione logos das empresas (PNG, JPG, GIF até 5MB)
3. **Validação**: Campos obrigatórios são validados automaticamente

### 2. Criação da Proposta

1. **Editor Rico**: Use a barra de ferramentas para formatar o texto
2. **Templates**: Salve templates reutilizáveis ou carregue existentes
3. **Formatação**: Aplique estilos, cores, fontes e tamanhos
4. **Conteúdo**: Adicione títulos, listas, links e imagens

### 3. Preview e Exportação

1. **Aba Preview**: Visualize a proposta no formato A4
2. **Zoom**: Ajuste o zoom para melhor visualização
3. **Exportar PDF**: Gere PDF profissional com um clique
4. **Compartilhar**: Crie link para visualização (somente leitura)

## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/
│   │   └── templates/          # API routes para templates
│   ├── globals.css             # Estilos globais
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Página principal
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── config-tab.tsx          # Aba de configuração
│   ├── preview-tab.tsx         # Aba de preview
│   └── rich-text-editor.tsx    # Editor de texto rico
├── lib/
│   └── utils.ts                # Utilitários
├── scripts/
│   └── create-templates-table.sql # Script de criação do banco
├── data/
│   └── templates.db            # Banco SQLite (criado automaticamente)
└── README.md
\`\`\`

## 🔌 API Endpoints

### Templates

- `GET /api/templates` - Lista todos os templates
- `POST /api/templates` - Cria novo template
- `PUT /api/templates/[id]` - Atualiza template existente  
- `DELETE /api/templates/[id]` - Remove template

### Administração

- `GET /api/admin/rate-limit` - Estatísticas de rate limiting (requer chave de admin)

### Rate Limiting

Todas as rotas da API estão protegidas com rate limiting:
- **Limite**: 30 requisições por minuto por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite máximo de requisições
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp de reset do limite
  - `Retry-After`: Segundos para tentar novamente (quando limitado)

### Exemplo de Uso da API

\`\`\`javascript
// Criar template
const response = await fetch('/api/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Meu Template',
    content: '<h1>Conteúdo HTML</h1>',
    description: 'Descrição opcional'
  })
})

// Listar templates
const templates = await fetch('/api/templates').then(res => res.json())
\`\`\`

## 🎨 Personalização

### Cores e Tema

As cores podem ser personalizadas no arquivo `app/globals.css`:

\`\`\`css
@theme inline {
  --color-primary: 59 130 246;      /* Azul principal */
  --color-secondary: 100 116 139;   /* Cinza secundário */
  --color-accent: 34 197 94;        /* Verde de destaque */
}
\`\`\`

### Templates Padrão

O sistema inclui templates padrão que podem ser modificados no arquivo `scripts/create-templates-table.sql`.

## 🔧 Desenvolvimento

### Scripts Disponíveis

\`\`\`bash
npm run dev          # Execução em desenvolvimento
npm run build        # Build para produção (inclui geração do Prisma Client)
npm run start        # Execução em produção
npm run lint         # Verificação de código

# Comandos do banco de dados
npm run db:push      # Push do schema para o banco
npm run db:migrate   # Criar migração
npm run db:deploy    # Aplicar migrações em produção
npm run db:studio    # Interface visual do banco
npm run db:seed      # Popular banco com dados iniciais
npm run db:reset     # Reset do banco de dados
\`\`\`

### Estrutura do Banco de Dados

\`\`\`sql
model Template {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  content     String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("templates")
}
\`\`\`

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Admin (opcional)
ADMIN_KEY="sua-chave-secreta-para-admin"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Problemas Conhecidos

- O editor pode ter problemas de cursor em alguns navegadores antigos
- Imagens muito grandes podem afetar a performance do PDF
- Rate limiting pode afetar usuários com muitas requisições simultâneas

## 🔮 Roadmap

- [x] Rate limiting para proteção da API
- [x] Integração com Neon DB (PostgreSQL)
- [x] Sistema de templates com Prisma ORM
- [x] Exportação PDF otimizada
- [ ] Integração com APIs de CEP
- [ ] Assinatura digital de propostas
- [ ] Sistema de aprovação/rejeição
- [ ] Notificações por email
- [ ] Versionamento de propostas
- [ ] Dashboard de analytics
- [ ] Integração com CRM
- [ ] Autenticação de usuários
- [ ] Logs de auditoria

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email: ruan.kaylo@gmail.com

---

Desenvolvido com ❤️ usando Next.js e TypeScript
\`\`\`

```json file="" isHidden
