#define PIN1 5
#define PIN2 4
#define DELAY 30
void setup() {

Serial.begin(115200);
pinMode(PIN1, OUTPUT);
pinMode(PIN2, OUTPUT);
digitalWrite(PIN1, LOW);
digitalWrite(PIN2, LOW);
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
  Serial.println("START SEQUENCE");
  set_new_temp(10.0);
  Serial.println("10.0");
  delay(3000);
  set_new_temp(15.0);
  Serial.println("15.0");
  delay(3000);
  set_new_temp(20.0);
  Serial.println("20");
  delay(3000);
  set_new_temp(25.0);
  Serial.println("25.0");
  delay(3000);
  set_new_temp(30.0);
  Serial.println("30.0");
  delay(3000);
  set_new_temp(11.5);
  Serial.println("11.5");
  delay(3000);
  set_new_temp(5);
  Serial.println("5");
  delay(3000);
  Serial.println("END SEQUENCE");
  
}
