# Sistema de Upload de Logo para Cloudinary

## Visão Geral

Sistema completo de upload de logo do contratante para o Cloudinary, com armazenamento no banco de dados e exibição automática no preview do PDF.

## Funcionalidades Implementadas

### 1. **Upload de Logo**
- Upload de imagens (PNG, JPG, etc.) com limite de 2MB
- Preview da imagem antes de salvar
- Validação de tipo e tamanho de arquivo
- Upload apenas ao clicar em "Salvar e Aplicar"

### 2. **Organização no Cloudinary**
- Cada contratante tem sua própria pasta: `contractors/{userId}`
- Imagens são otimizadas automaticamente (max 500x500px)
- Formato e qualidade otimizados automaticamente

### 3. **Armazenamento no Banco**
- Modelo `Contractor` no Prisma com campos:
  - `userId`: ID do usuário (Stack Auth)
  - `nome`, `documento`, `endereco`, `telefone`, `email`
  - `logoUrl`: URL da imagem no Cloudinary
  - `logoPublicId`: ID público da imagem (para deletar)

### 4. **Exibição no Preview**
- Logo carregada automaticamente do Cloudinary
- Fallback para arquivo local se disponível
- Placeholder "LOGO" se nenhuma imagem estiver disponível

## Arquivos Criados/Modificados

### Novos Arquivos:
1. **`lib/cloudinary.ts`** - Configuração do Cloudinary
2. **`app/api/upload/route.ts`** - API para upload/delete de imagens
3. **`app/api/contractor/route.ts`** - API para CRUD de contratantes

### Arquivos Modificados:
1. **`prisma/schema.prisma`** - Adicionado modelo `Contractor`
2. **`app/page.tsx`** - Modal de configurações globais com upload
3. **`components/preview-tab.tsx`** - Suporte para logo do Cloudinary

## Como Usar

### 1. Configurar Credenciais do Cloudinary

Certifique-se de que o arquivo `.env` contém:

```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### 2. Aplicar Migrations (Já Feito)

```bash
npx prisma generate
npx prisma db push
```

### 3. Usar o Sistema

1. **Login**: Faça login no sistema
2. **Configurações Globais**: Clique no botão "Configurações Globais"
3. **Preencher Dados**: Complete os dados do contratante
4. **Upload de Logo**: 
   - Clique em "Fazer Upload"
   - Selecione uma imagem (PNG, JPG, até 2MB)
   - Veja o preview da imagem
5. **Salvar**: Clique em "Salvar e Aplicar"
   - A imagem será enviada para o Cloudinary
   - Os dados serão salvos no banco
   - A logo aparecerá automaticamente no preview

### 4. Visualizar no Preview

- Vá para a aba "Visualização"
- A logo do contratante aparecerá no cabeçalho do PDF
- A imagem é carregada diretamente do Cloudinary

## Estrutura de Pastas no Cloudinary

```
contractors/
  ├── user_id_1/
  │   └── logo.png
  ├── user_id_2/
  │   └── logo.jpg
  └── ...
```

## API Endpoints

### Upload de Imagem
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (imagem)
- folderName: string (nome da pasta)

Response:
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "contractors/user_id/..."
}
```

### Salvar Contratante
```
POST /api/contractor
Content-Type: application/json

Body:
{
  "userId": "string",
  "nome": "string",
  "documento": "string",
  "endereco": "string",
  "telefone": "string",
  "email": "string",
  "logoUrl": "string",
  "logoPublicId": "string"
}
```

### Buscar Contratante
```
GET /api/contractor?userId={userId}

Response:
{
  "id": 1,
  "userId": "string",
  "nome": "string",
  ...
  "logoUrl": "string",
  "logoPublicId": "string"
}
```

## Validações

- **Tipo de arquivo**: Apenas imagens (image/*)
- **Tamanho**: Máximo 2MB
- **Campos obrigatórios**: nome, documento, endereço, telefone, email
- **Autenticação**: Usuário deve estar logado

## Otimizações Aplicadas

1. **Transformações do Cloudinary**:
   - Redimensionamento: max 500x500px
   - Qualidade: automática
   - Formato: automático (WebP quando suportado)

2. **Performance**:
   - Upload assíncrono
   - Loading states durante upload
   - Preview local antes do upload

## Próximos Passos (Opcionais)

- [ ] Adicionar cropping de imagem antes do upload
- [ ] Permitir múltiplas logos (histórico)
- [ ] Adicionar logo do contratado também
- [ ] Implementar cache de imagens
- [ ] Adicionar watermark automático

## Troubleshooting

### Erro: "Property 'contractor' does not exist"
- Execute: `npx prisma generate`
- Reinicie o servidor de desenvolvimento

### Imagem não aparece no preview
- Verifique se o upload foi bem-sucedido
- Verifique as credenciais do Cloudinary
- Verifique o console do navegador para erros

### Erro de CORS
- Certifique-se de que o domínio está configurado no Cloudinary
- Verifique as configurações de segurança do Cloudinary
