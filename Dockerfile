FROM node:24

RUN npm install -g openclaw@latest && \
    openclaw plugins install @ytlailabs/ilmu-openclaw-plugin

RUN apt-get update && apt-get install -y python3 python3-pip curl && rm -rf /var/lib/apt/lists/*

VOLUME /root

# Stage the ImagineHack OpenClaw skill outside /root so the named volume doesn't
# shadow it. entrypoint.sh syncs it into /root/.openclaw/plugin-skills at startup.
COPY openclaw/plugin-skills /opt/imaginehack/plugin-skills

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
