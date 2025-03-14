FROM node:18-buster-slim
WORKDIR /app/

COPY . /app/
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]

ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_BACKEND_URL

ENV NEXT_PUBLIC_FRONTEND_URL $NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_BACKEND_URL $NEXT_PUBLIC_BACKEND_URL

# Copy Nginx config
COPY ./default.conf /etc/nginx/nginx.conf

EXPOSE 3000