FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-ResourceService.git /usr/local/src/resourceservice
RUN cd /usr/local/src/resourceservice; npm install
CMD ["nodejs", "/usr/local/src/resourceservice/app.js"]

EXPOSE 8831
