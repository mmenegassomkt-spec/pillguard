# 📱 Guia para Gerar o .AAB (Android App Bundle)

## 🔧 Passo 1: Criar conta no Expo

1. Acesse: https://expo.dev/signup
2. Crie sua conta (pode usar Google ou email)
3. Anote seu **username** do Expo

---

## 💻 Passo 2: Instalar EAS CLI no seu computador

Abra o terminal do seu computador e execute:

```bash
npm install -g eas-cli
```

---

## 🔑 Passo 3: Fazer login no Expo

```bash
eas login
```

Digite seu email e senha do Expo.

---

## 📂 Passo 4: Baixar o projeto

Você precisa baixar os arquivos do projeto para seu computador.

**Opção A - Via GitHub (se conectado):**
```bash
git clone [seu-repositorio]
cd frontend
```

**Opção B - Download manual:**
- Baixe os arquivos da pasta `/app/frontend` deste ambiente
- Coloque em uma pasta no seu computador

---

## 🔗 Passo 5: Conectar ao projeto Expo

Na pasta do projeto, execute:

```bash
eas init
```

Isso vai:
- Criar um projeto no Expo
- Gerar um `projectId` único
- Atualizar o `app.json` automaticamente

---

## 🏗️ Passo 6: Gerar o .AAB

Execute o comando:

```bash
eas build --platform android --profile production
```

### O que vai acontecer:
1. ⏳ O build será enviado para os servidores do Expo
2. 🔨 Será compilado na nuvem (leva ~10-15 minutos)
3. 📥 Você receberá um link para baixar o `.aab`

---

## 📋 Informações do App

| Campo | Valor |
|-------|-------|
| **Nome** | PillGuard |
| **Pacote** | com.pillguard.app |
| **Versão** | 1.0.26 |
| **Version Code** | 26 |

---

## ⚠️ Notas Importantes

### Keystore (Chave de Assinatura)
- Na **primeira vez**, o EAS vai gerar uma keystore automaticamente
- **GUARDE ESSA CHAVE!** Você precisará dela para todas as atualizações futuras
- Execute `eas credentials` para gerenciar suas chaves

### Conta Expo Gratuita
- Você tem **30 builds gratuitos por mês**
- Suficiente para desenvolvimento normal

### Publicar na Play Store
Depois de ter o `.aab`:
1. Acesse: https://play.google.com/console
2. Crie um app novo
3. Faça upload do `.aab` em "Produção" ou "Teste interno"

---

## 🆘 Problemas Comuns

### "Project not found"
```bash
eas init
```

### "Credentials missing"
```bash
eas credentials
```

### Ver status do build
```bash
eas build:list
```

---

## 📞 Suporte

Se tiver dúvidas, me pergunte aqui no chat!
