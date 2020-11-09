#FROM ubuntu
#RUN apt-get update
#RUN apt-get install -y git nodejs npm
#RUN git clone git://github.com/DuoSoftware/DVP-ResourceService.git /usr/local/src/resourceservice
#RUN cd /usr/local/src/resourceservice; npm install
#CMD ["nodejs", "/usr/local/src/resourceservice/app.js"]

#EXPOSE 8831

# FROM node:9.9.0
# ARG VERSION_TAG
# RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-ResourceService.git /usr/local/src/resourceservice
# RUN cd /usr/local/src/resourceservice;
# WORKDIR /usr/local/src/resourceservice
# RUN npm install
# EXPOSE 8831
# CMD [ "node", "/usr/local/src/resourceservice/app.js" ]

FROM node:10
WORKDIR /usr/local/src/resourceservice
COPY package*.json ./
RUN apk add --update python make g++\
   && rm -rf /var/cache/apk/*
RUN npm install
COPY . .
EXPOSE 8831
CMD [ "node", "app.js" ]
