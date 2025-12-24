# 🔥 Guia de Configuração do Firebase para PillGuard

Este guia explica como configurar o Firebase para que os alarmes funcionem no app publicado.

## 📋 Pré-requisitos

- Conta Google
- Projeto exportado para o GitHub
- Node.js instalado no seu computador

---

## 🚀 Passo a Passo

### 1️⃣ Criar Projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Criar um projeto"** (ou "Add project")
3. Nome do projeto: `PillGuard` (ou outro nome)
4. **Desative** o Google Analytics (não precisamos para alarmes)
5. Clique em **"Criar projeto"**

### 2️⃣ Adicionar App Android

1. Na tela inicial do projeto, clique no ícone **Android** 🤖
2. Preencha os dados:
   - **Nome do pacote Android**: `com.pillguard.app`
   - **Apelido do app**: PillGuard
   - **Certificado SHA-1**: (pule por enquanto, vamos adicionar depois)
3. Clique em **"Registrar app"**

### 3️⃣ Baixar google-services.json

1. Clique em **"Baixar google-services.json"**
2. Salve o arquivo na pasta `frontend/` do projeto (na raiz, junto com package.json)
3. Clique em **"Próximo"** até finalizar

### 4️⃣ Configurar Cloud Messaging (Notificações)

1. No menu lateral, vá em **"Engajamento"** → **"Cloud Messaging"**
2. Pode aparecer um aviso para habilitar, clique em **"Ativar"**
3. Pronto! O FCM já está configurado automaticamente

---

## 💻 Configuração Local (no seu computador)

Após baixar o projeto do GitHub:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pillguard.git
cd pillguard/frontend

# 2. Instale as dependências
npm install

# 3. Instale o EAS CLI (para gerar o APK)
npm install -g eas-cli

# 4. Faça login no Expo
npx eas login

# 5. Configure o projeto no EAS
npx eas build:configure

# 6. Gere o APK de teste
npx eas build --platform android --profile preview
```

---

## 📱 Tipos de Build

| Profile | Uso | Comando |
|---------|-----|---------|
| `preview` | Teste interno (APK direto) | `npx eas build -p android --profile preview` |
| `production` | Play Store (AAB) | `npx eas build -p android --profile production` |

---

## ✅ Verificação

Após o build, o EAS vai gerar um link para baixar o APK. Instale no celular e verifique se:

1. ✅ O app abre normalmente
2. ✅ Pede permissão de notificações
3. ✅ Os alarmes tocam no horário configurado

---

## 🔧 Solução de Problemas

### Notificações não aparecem?

1. Verifique se deu permissão nas configurações do Android
2. Verifique se o "Modo Não Perturbe" está desativado
3. Vá em Configurações → Apps → PillGuard → Notificações → Ative tudo

### Alarmes não tocam com app fechado?

1. Vá em Configurações → Apps → PillGuard
2. Bateria → Desativar otimização de bateria
3. Notificações → Marcar como "Urgente" ou "Alta prioridade"

---

## 📞 Suporte

Se tiver dúvidas, abra uma issue no repositório GitHub ou entre em contato.
