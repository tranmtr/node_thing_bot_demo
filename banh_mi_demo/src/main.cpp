#include <Arduino.h>
#include "WiFi.h"    // thu vien can khai bao
#include <WiFiClient.h>
#include <PubSubClient.h>


WiFiClient client;
PubSubClient mqtt_client(client);

const char *ssid = "HUYEN HIEU";
const char *password = "058223947";
const char *server_mqtt = "192.168.1.6";
const int port_mqtt = 1883;
const char *mqtt_id = "esp32";
const char *topic_subscribe = "to-esp32";
const char *topic_publish = "from-esp32";
const int waiting_time = 30000;

int cnt = 0;
unsigned long last_time = 0;
void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.print("Recived from: ");
    Serial.println(topic);
    Serial.print("Message: ");
    for(size_t i = 0; i < length; i++)
    {
        Serial.print(char(payload[i]));
    }
    Serial.println();
    Serial.println(".....................");
}

void setup()
{
    Serial.begin(9600); // Khai bao toc do cong Serial
    Serial.print(" ");
    Serial.print("Connecting to WIFI ... ");
    
    WiFi.begin(ssid, password);
    int beginConnect = millis();
    while(WiFi.status() != WL_CONNECTED && millis() - beginConnect < waiting_time) // kiem tra ket noi Wifi
    {
        delay(500);
        Serial.print(".");
    }
    if(WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Falled");
    }
    else
    {
        Serial.println("WiFi connected.");
        Serial.print("IP address: "); // In thong tin dia chi IP address
        Serial.print(WiFi.localIP());
    }
    
    mqtt_client.setServer(server_mqtt, port_mqtt);
    mqtt_client.setCallback(callback);
    
    Serial.println("Connecting to mqtt ");
    while(!mqtt_client.connect(mqtt_id))
    {
        delay(500);
    }
    Serial.println("Connected to mqtt ");
    mqtt_client.publish(topic_publish, "Hello Server");
    mqtt_client.subscribe(topic_subscribe);
}

void sendToServer()
{
    if(millis() - last_time > 500)
    {
        if(cnt > 32000)
        {
            cnt = 0;
        }
        if(mqtt_client.connected())
        {
            mqtt_client.publish(topic_publish, String(cnt).c_str());
        }
        cnt = cnt + 1;
    }
}

void loop()
{
    mqtt_client.loop();
    sendToServer();
    delay(500);
}



