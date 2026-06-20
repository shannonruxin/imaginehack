FROM node:24

RUN npm install -g openclaw@latest && \
    openclaw plugins install @ytlailabs/ilmu-openclaw-plugin

RUN apt-get update && apt-get install -y python3 python3-pip curl && rm -rf /var/lib/apt/lists/*

VOLUME /root

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
