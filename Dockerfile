FROM node:18

RUN apt update
RUN apt install -y nano libx11-xcb1 libxrandr2 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libxtst6 libgtk-3-0 libatk1.0-0 libasound2 libdbus-glib-1-2 libdbus-1-3

WORKDIR /app

COPY . .
COPY /data/key/known_hosts /root/.ssh/known_hosts

RUN chmod 644 /root/.ssh/known_hosts
RUN chmod 400 ./data/key/ssh_priv_key.pem

RUN npm install
RUN npm run build