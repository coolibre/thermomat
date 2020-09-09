# Thermomat
Low cost smart home IOT heating with adapted eq3n and esp8266-07.
Server, Webapp and ESP8266 code for autonomous thermostat controling over the internet.

Inspired by https://abtlog.wordpress.com/2016/03/07/heizungsthermostatsteuerung-mit-esp8266-fuer-unter-5-eur
For building the thermostat consult the above link. Hint: You can leave out the transistors.

# Hardware
https://www.amazon.de/Eqiva-Heizk%C3%B6rperthermostat-Model-N-132231K0A/dp/B00NU71Q44/ref=sr_1_3?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=eq3+n&qid=1584788986&sr=8-3

https://www.amazon.de/AZDelivery-ESP8266-Wireless-serielles-Arduino/dp/B0737D3WLZ/ref=sr_1_3?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=esp8266-7&qid=1584789083&sr=8-3

# Webapp features
## Authentication

![login](https://user-images.githubusercontent.com/58222491/77454388-bee1af80-6df8-11ea-8448-9a852408d4fc.JPG)

## Rooms and daily based Temperature Plans

![2](https://user-images.githubusercontent.com/58222491/77454384-bdb08280-6df8-11ea-9020-3b1ae60e18e6.JPG)

![3](https://user-images.githubusercontent.com/58222491/77454385-be491900-6df8-11ea-8f65-333f66f8fcb9.JPG)

## Copy Temperature Settings between rooms, days, plans
![4](https://user-images.githubusercontent.com/58222491/77454387-bee1af80-6df8-11ea-87cd-d835a5c49466.JPG)

## Further features
- responsive design to be used on Smartphone and Tablet

# Device features
- WifiManager to make device configurable (as Access Point). Once configured connects as Wifi client
- Deep Sleep and Wake Up every 15 min to save energy
- stays on for reconfiguring 3 mins while network unreachable, sleeps and reconnects if not configured in this period
- provides reset pin for clearing wifi Settings and force configuring mode
