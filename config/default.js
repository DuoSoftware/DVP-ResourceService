module.exports = {
 "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"localhost",//104.131.105.222
    "Database":"dvpdb" //duo
  },
  "Redis":
  {
    "ip": "45.55.142.207",
    "port": 6389,
    "password":"DuoS123",
      "redisdb":8,
      "ardsData":6
  },

    "Security":
    {
        "ip": "45.55.142.207",
        "port": 6389,
        "user": "DuoS123",
        "password": "DuoS123"

    },

  "Host":
  {
    "domain": "0.0.0.0",
    "port": 8831,
    "version":"6.0",
    "hostpath":"./config",
    "logfilepath": ""
  }
};