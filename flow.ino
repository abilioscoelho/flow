#include <WiFi.h>
#include <HTTPClient.h>

// --- CONFIGURAÇÕES ---
const char* ssid = "Abilio";
const char* password = "12345678";
const char* serverUrl = "https://api.abiliocoelho.dev/semaphore/1";
const char* authToken = "oat_Mg.MEJXZ3dEMG9OTS1tMnhFLW5qMXQ1V1plU2RIdW1xaWtURHExMWlFZzI5MzM3OTI4NjI!";

// --- PINOS ---
const int LED = 2;
const int CHAVE_ESQ = 23;
const int CHAVE_DIR = 22;
const int RELE_1 = 19;
const int RELE_2 = 18;
const int BUZZER = 5;

// --- VARIÁVEIS ---
int estadoAnterior = -1;
int estadoLido = -1;
unsigned long ultimaMudanca = 0;
unsigned long tempoAbertura = 0;
bool alarmeAtivo = false;

// Variáveis WiFi (reconexão NÃO BLOQUEANTE)
unsigned long ultimoWiFiCheck = 0;
const unsigned long wifiInterval = 5000;  
bool wifiConectado = false;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SISTEMA INICIADO ===");

  // Configura pinos
  pinMode(LED, OUTPUT);
  
  pinMode(CHAVE_ESQ, INPUT_PULLUP);
  pinMode(CHAVE_DIR, INPUT_PULLUP);

  pinMode(RELE_1, OUTPUT);
  pinMode(RELE_2, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // Estado inicial dos relés (seguro)
  digitalWrite(RELE_1, HIGH);
  digitalWrite(RELE_2, HIGH);
  digitalWrite(BUZZER, LOW);

  Serial.println("Reles inicializados (VERMELHO)");

  // Primeira tentativa de Wi-Fi (não-bloqueante)
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
}

void loop() {

  if(wifiConectado){
    digitalWrite(LED, HIGH);
  }else{
    digitalWrite(LED, LOW);
  }

  // --------------------------------------------------
  // 1) CONTROLE DA PONTE (BOTÕES → RELÉS)
  // --------------------------------------------------
  int esq = digitalRead(CHAVE_ESQ);
  int dir = digitalRead(CHAVE_DIR);

  int estadoAtual = 0;  // centro
  if (esq == LOW && dir == HIGH) estadoAtual = 1;  // Teresina
  if (dir == LOW && esq == HIGH) estadoAtual = 2;  // Timon

  if (estadoAtual != estadoLido) {
    estadoLido = estadoAtual;
    ultimaMudanca = millis();
  }

  // Debounce 200ms
  if (estadoLido != estadoAnterior && (millis() - ultimaMudanca >= 200)) {
    estadoAnterior = estadoLido;

    switch (estadoAnterior) {

      case 1:  // Esquerda → Teresina VERDE
        digitalWrite(RELE_1, LOW);
        digitalWrite(RELE_2, HIGH);
        tempoAbertura = millis();
        alarmeAtivo = false;
        digitalWrite(BUZZER, LOW);
        Serial.println("Teresina VERDE | Timon VERMELHO");
        enviarHttp("Teresina");
        break;

      case 2:  // Direita → Timon VERDE
        digitalWrite(RELE_1, HIGH);
        digitalWrite(RELE_2, LOW);
        tempoAbertura = millis();
        alarmeAtivo = false;
        digitalWrite(BUZZER, LOW);
        Serial.println("Teresina VERMELHO | Timon VERDE");
        enviarHttp("Timon");
        break;

      default:  // Centro → Ambos VERMELHO
        digitalWrite(RELE_1, HIGH);
        digitalWrite(RELE_2, HIGH);
        tempoAbertura = 0;
        alarmeAtivo = false;
        digitalWrite(BUZZER, LOW);
        Serial.println("Ambos VERMELHO");
        enviarHttp("Stop");
        break;
    }
  }

  // --------------------------------------------------
  // 2) ALARME (tempo aberto)
  // --------------------------------------------------
  if ((estadoAnterior == 1 || estadoAnterior == 2) && tempoAbertura > 0) {
    if (!alarmeAtivo && (millis() - tempoAbertura >= 300000)) {
      alarmeAtivo = true;
      Serial.println("ALARME! Sinal aberto há 5 minutos");
    }

    if (alarmeAtivo) {
      digitalWrite(BUZZER, (millis() / 500) % 2);
    }
  }

  // --------------------------------------------------
  // 3) RECONEXÃO WIFI (NON-BLOCKING)
  // --------------------------------------------------
  if (millis() - ultimoWiFiCheck >= wifiInterval) {
    ultimoWiFiCheck = millis();

    if (WiFi.status() != WL_CONNECTED) {
      wifiConectado = false;
      Serial.println("WiFi desconectado. Tentando reconectar...");
      WiFi.disconnect();
      WiFi.begin(ssid, password);
    } else {
      if (!wifiConectado) {
        Serial.printf("WiFi reconectado — IP: %s\n", WiFi.localIP().toString().c_str());
      }
      wifiConectado = true;
    }
  }
}

// --------------------------------------------------
// ENVIO PARA API (NÃO BLOQUEANTE, TEM TIMEOUT CURTO)
// --------------------------------------------------
void enviarHttp(String origem) {
  if (!wifiConectado) return;

  HTTPClient http;
  http.setTimeout(1000);
  http.setConnectTimeout(1000);
  http.setReuse(false);

  if (http.begin(serverUrl)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(authToken));

    String json = "{\"origin\":\"" + origem + "\"}";
    int code = http.PUT(json);
    http.end();

    if (code == 200) {
      Serial.printf("API OK: %s\n", origem.c_str());
    } else {
      Serial.printf("ERRO API (%d)\n", code);
    }
  }
}