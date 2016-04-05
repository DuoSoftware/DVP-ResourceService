module.exports = {
 "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"104.131.105.222",
    "Database":"duo"
  },
  "Redis":
  {
    "ip": "45.55.142.207",
    "port": 6379,
    "password":"DuoS123"
  },

    "Security":
    {
        "ip": "45.55.142.207",
        "port": 6379,
        "user": "SYS_REDIS_USER",
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