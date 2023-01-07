FROM ocaml/opam:alpine-3.16-ocaml-4.14

USER root

# Create app directory
WORKDIR /usr/src/app
VOLUME [ "/usr/src/app" ]
RUN apk --update add nodejs npm

RUN opam init --disable-sandboxing  \
 && opam update \
 && opam upgrade \
 && opam install --unlock-base cpdf.2.5 \
 && eval $(opam env)
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

RUN npm install pm2 -g

# Bundle app source
COPY . .

EXPOSE 6499

CMD [ "pm2-runtime","--json", "process.yml" ]