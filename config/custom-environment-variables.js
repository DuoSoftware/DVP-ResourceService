module.exports = {
 "DB": {
    "Type":"SYS_DATABASE_TYPE",
    "User":"SYS_DATABASE_POSTGRES_USER",
    "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
    "Port":"SYS_SQL_PORT",
    "Host":"SYS_DATABASE_HOST",
    "Database":"SYS_DATABASE_POSTGRES_USER"
  },
    "Host":
    {
        "domain": "HOST_NAME",
        "port": "HOST_RESOURCESERVICE_PORT",
        "version": "HOST_VERSION",
        "hostpath":"HOST_PATH",
        "logfilepath": "LOG4JS_CONFIG"
    },
    "Redis":
    {
        "ip": "SYS_DASHBOARD_REDIS_HOST",
        "port": "SYS_DASHBOARD_REDIS_PORT",
        "password":"SYS_DASHBOARD_REDIS_PASSWORD",
        "redisdb":"SYS_REDIS_DB_DASHBOARD"
    },
    "ArdsRedis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "password":"SYS_REDIS_PASSWORD",
        "ardsData":"SYS_REDIS_DB_ARDS"
    },

    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    }
};

