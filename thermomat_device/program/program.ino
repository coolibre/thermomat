#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include "WiFiManager.h"          //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>
#define WIFI_RESET_PIN 14
#define PIN1 5
#define PIN2 4
#define DELAY 30

const char* apiSetting;
char apiEndpoint[40] = "http://192.168.0.99:5050";
char room[40] = "livingroom";
//default custom static IP
char static_ip[16] = "192.168.0.110";
char static_gw[16] = "192.168.0.1";
char static_sn[16] = "255.255.255.0";
//flag for saving data
bool shouldSaveConfig = false;

void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(PIN1, OUTPUT);
  pinMode(PIN2, OUTPUT);
  pinMode(WIFI_RESET_PIN, INPUT);
  digitalWrite(PIN1, HIGH);
  digitalWrite(PIN2, HIGH);
  digitalWrite(WIFI_RESET_PIN, HIGH);


  //clean FS, if added new properties
  //SPIFFS.format();

  //read configuration from FS json
  Serial.println("mounting FS...");
  
  if (SPIFFS.begin()) {
    Serial.println("mounted file system");
    if (SPIFFS.exists("/config.json")) {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);
        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");
          strcpy(apiEndpoint, json["apiEndpoint"]);
          strcpy(room, json["room"]);
          if(json["ip"]) {
            Serial.println("setting custom ip from config");
            strcpy(static_ip, json["ip"]);
            strcpy(static_gw, json["gateway"]);
            strcpy(static_sn, json["subnet"]);
            Serial.println(static_ip);
          } else {
            Serial.println("no custom ip in config");
          }
          Serial.println("loaded config:");
          Serial.println(apiEndpoint);
          Serial.println(room);
          Serial.println(static_ip);
        } else {
          Serial.println("failed to load json config");
        }
        configFile.close();
      }
    }
  } else {
    Serial.println("failed to mount FS");
  }
  //end read
  WiFiManagerParameter apiParam("api", "Thermocontrol api endpoint", apiEndpoint, 40);
  WiFiManagerParameter roomParam("room", "Room", room, 40);

  WiFiManager wifiManager;
  wifiManager.setConnectTimeout(60);
  wifiManager.setConfigPortalTimeout(240);
  // is configuration portal requested?
  if ( digitalRead(WIFI_RESET_PIN) == LOW ) {
    Serial.println("WIFI_RESET_PIN is low. resetting WIFI");
    SPIFFS.format();
    wifiManager.resetSettings();
  } else {
     Serial.println("WIFI_RESET_PIN is high. Keeping configured WIFI");
  }
  wifiManager.setSaveConfigCallback(saveConfigCallback);
  IPAddress _ip,_gw,_sn;
  _ip.fromString(static_ip);
  _gw.fromString(static_gw);
  _sn.fromString(static_sn);
  wifiManager.setSTAStaticIPConfig(_ip, _gw, _sn);
  //add all your parameters here
  wifiManager.addParameter(&apiParam);
  wifiManager.addParameter(&roomParam);
  
  //fetches ssid and pass and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  if(!wifiManager.autoConnect("Thermomat AP", "thermomat")) {
    Serial.println("failed to connect and hit timeout");
    //reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(1000);
  } 

  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");
  //read updated parameters
  strcpy(apiEndpoint, apiParam.getValue());
  strcpy(room, roomParam.getValue());
  //strcpy(staticIp, staticIpParam.getValue());
  //strcpy(staticGw, staticGwParam.getValue());
  //strcpy(staticSn, staticSnParam.getValue());

  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["apiEndpoint"] = apiEndpoint;
    json["room"] = room;
    json["ip"] = WiFi.localIP().toString();
    json["gateway"] = WiFi.gatewayIP().toString();
    json["subnet"] = WiFi.subnetMask().toString();
    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //end save
  }

}

void set_new_temp(float temp) {
  float new_temp = (temp * 2) - 10;
  pulse("-", 60, DELAY);
  pulse("+", new_temp, DELAY);
}

void pulse(char dir[], float qty_pulses, int del) {
  bool pinStatus = digitalRead(PIN1);
  for (int i = 0; i <= qty_pulses; i++) {
    if (pinStatus == LOW) {
      pinStatus = HIGH;
    } else {
      pinStatus = LOW;
    }
    if (dir == "-") {
      digitalWrite(PIN1, pinStatus);
      delay(del);
      digitalWrite(PIN2, pinStatus);
      delay(del);
    } else if (dir == "+") {
      digitalWrite(PIN2, pinStatus);
      delay(del);
      digitalWrite(PIN1, pinStatus);
      delay(del);
    }
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  HTTPClient http;  //Declare an object of class HTTPClient
  String api = (String)apiEndpoint + "/temperature/get?room=" + (String)room ;
  http.begin(api);  //Specify request destination
  Serial.println("requesting " + api); 
  int httpCode = http.GET();    
  String payload = "";
  if (httpCode > 0) { //Check the returning code
    payload = http.getString();   //Get the request response payload
    Serial.println(payload);                     //Print the response payload
  } 
  http.end();   //Close connection
  if (payload != "") {
    set_new_temp(payload.toFloat());
  }
  ESP.deepSleep(900*1000000);
}
