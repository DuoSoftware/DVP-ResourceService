FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-ResourceService.git /usr/local/src/resourceService
RUN cd /usr/local/src/resourceService; npm install
CMD ["nodejs", "/usr/local/src/resourceService/app.js"]

EXPOSE 8831