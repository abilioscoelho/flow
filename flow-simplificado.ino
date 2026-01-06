#include <WiFi.h>
#include <HTTPClient.h>

// --- CONFIGURAÇÕES ---
const char* ssid = "GUARITA METALICA";
const char* password = "agentes2025";
const char* serverUrl = "https://api.abiliocoelho.dev/semaphore/1";
const char* authToken = "oat_Mg.MEJXZ3dEMG9OTS1tMnhFLW5qMXQ1V1plU2RIdW1xaWtURHExMWlFZzI5MzM3OTI4NjI";

// --- PINOS ---
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

// Variáveis WiFi
bool wifiConectado = false;
bool tentouConectar = false;  // Tenta conectar apenas 1 vez

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SISTEMA INICIADO ===");
  
  // Configura pinos
  pinMode(CHAVE_ESQ, INPUT_PULLUP);
  pinMode(CHAVE_DIR, INPUT_PULLUP);
  pinMode(RELE_1, OUTPUT);
  pinMode(RELE_2, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  // Estado inicial: ambos vermelho
  digitalWrite(RELE_1, HIGH);
  digitalWrite(RELE_2, HIGH);
  digitalWrite(BUZZER, LOW);
  Serial.println("Reles inicializados (VERMELHO)");
  
  // Tenta conectar WiFi apenas 1 vez
  tentarConectarWiFi();
  
  Serial.println("=== SISTEMA PRONTO ===\n");
}

void loop() {
  // Lê chaves
  int esq = digitalRead(CHAVE_ESQ);
  int dir = digitalRead(CHAVE_DIR);
  
  // Define estado (0=centro, 1=esquerda, 2=direita)
  int estadoAtual = 0;
  if (esq == LOW && dir == HIGH) estadoAtual = 1;
  if (dir == LOW && esq == HIGH) estadoAtual = 2;
  
  // Detecta mudança
  if (estadoAtual != estadoLido) {
    estadoLido = estadoAtual;
    ultimaMudanca = millis();
  }
  
  // Processa mudança após debounce (200ms)
  if (estadoLido != estadoAnterior && (millis() - ultimaMudanca >= 200)) {
    estadoAnterior = estadoLido;
    
    // Atualiza relés IMEDIATAMENTE
    switch (estadoAnterior) {
      case 1:  // Esquerda
        digitalWrite(RELE_1, LOW);
        digitalWrite(RELE_2, HIGH);
        tempoAbertura = millis();
        alarmeAtivo = false;
        digitalWrite(BUZZER, LOW);
        Serial.println("Teresina VERDE | Timon VERMELHO");
        enviarHttp("Teresina");
        break;
        
      case 2:  // Direita
        digitalWrite(RELE_1, HIGH);
        digitalWrite(RELE_2, LOW);
        tempoAbertura = millis();
        alarmeAtivo = false;
        digitalWrite(BUZZER, LOW);
        Serial.println("Teresina VERMELHO | Timon VERDE");
        enviarHttp("Timon");
        break;
        
      default:  // Centro
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
  
  // Alarme: sinal aberto há 5+ minutos
  if ((estadoAnterior == 1 || estadoAnterior == 2) && tempoAbertura > 0) {
    if (!alarmeAtivo && (millis() - tempoAbertura >= 300000)) {
      alarmeAtivo = true;
      Serial.println("ALARME! Sinal aberto ha 5 minutos");
    }
    
    if (alarmeAtivo) {
      digitalWrite(BUZZER, (millis() / 500) % 2);
    }
  }
  
  delay(50);
}

// --- FUNÇÕES WiFi ---

void tentarConectarWiFi() {
  if (tentouConectar) return;  // Apenas 1 tentativa
  
  tentouConectar = true;
  Serial.print("Conectando WiFi");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - inicio < 10000)) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConectado = true;
    Serial.printf("\nWiFi conectado - IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    wifiConectado = false;
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    Serial.println("\nWiFi indisponivel - Modo offline");
    Serial.println("(Reinicie para tentar novamente)");
  }
}

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
    
    if (code == 200) Serial.printf("API OK: %s\n", origem.c_str());
  }
}
