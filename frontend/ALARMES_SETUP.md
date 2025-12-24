# 🔔 Guia de Configuração de Alarmes - PillGuard

Este guia explica como os alarmes funcionam no PillGuard e como configurar para produção.

## ✅ O que já está configurado

O PillGuard usa **alarmes locais** do Android, sem depender de serviços externos:

| Recurso | Tecnologia | Status |
|---------|------------|--------|
| Alarmes exatos | AlarmManager (RTC_WAKEUP) | ✅ Configurado |
| Sobrevive reboot | RECEIVE_BOOT_COMPLETED | ✅ Configurado |
| Ignora Doze Mode | SET_EXACT_AND_ALLOW_WHILE_IDLE | ✅ Configurado |
| Notificações locais | Notifee | ✅ Configurado |

**🎉 Não precisa de Firebase para os alarmes funcionarem!**

---

## 📱 Como Funciona

1. **Ao criar um alarme**: O app agenda uma notificação usando AlarmManager nativo
2. **No horário do alarme**: O Android desperta o dispositivo e mostra a notificação
3. **Ações na notificação**: "Já tomei" ou "Pular" direto na notificação
4. **Alarmes críticos**: Mostram tela cheia e repetem até confirmação

---

## 🚀 Como Publicar o App

### Passo 1: Exportar para GitHub

1. Na Emergent, clique no ícone do **GitHub**
2. Conecte sua conta e salve o projeto

### Passo 2: Gerar o APK (no seu computador)

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/pillguard.git
cd pillguard/frontend

# Instale as dependências
npm install

# Instale o EAS CLI
npm install -g eas-cli

# Faça login no Expo
npx eas login

# Configure o projeto
npx eas build:configure

# Gere o APK de teste
npx eas build --platform android --profile preview
```

### Passo 3: Instalar e Testar

1. Baixe o APK gerado pelo EAS
2. Instale no celular
3. **Importante**: Vá em Configurações → Apps → PillGuard:
   - Notificações → Ativar todas
   - Bateria → Sem restrições
   - Permitir alarmes exatos

---

## ⚙️ Configurações Importantes no Android

Para garantir que os alarmes funcionem corretamente:

### 1. Permissões de Notificação
- O app vai pedir permissão automaticamente
- Aceite todas as permissões de notificação

### 2. Otimização de Bateria
Configurações → Apps → PillGuard → Bateria → **"Sem restrições"**

### 3. Alarmes Exatos (Android 12+)
Configurações → Apps → PillGuard → **"Permitir alarmes exatos"**

### 4. Modo Não Perturbe
- Alarmes críticos são configurados para **ignorar o modo não perturbe**
- Verifique se o PillGuard está como exceção nas configurações

---

## 🔧 Tipos de Build

| Profile | Uso | Comando |
|---------|-----|---------|
| `preview` | Teste interno (APK) | `npx eas build -p android --profile preview` |
| `production` | Play Store (AAB) | `npx eas build -p android --profile production` |

---

## ❓ Solução de Problemas

### Alarmes não tocam?
1. Verifique permissões de notificação
2. Desative otimização de bateria para o app
3. Permita alarmes exatos nas configurações

### Alarmes atrasam?
1. Desative o modo "Economia de bateria"
2. Verifique se o Doze Mode não está bloqueando

### Notificações não aparecem?
1. Vá em Configurações → Notificações → PillGuard
2. Ative todas as categorias (Alarmes e Alarmes Críticos)

---

## 📞 Suporte

Abra uma issue no GitHub se tiver problemas.

