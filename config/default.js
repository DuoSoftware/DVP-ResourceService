module.exports = {
    "DB": {
        "Type": "postgres",
        "User": "",
        "Password": "",
        "Port": 5432,
        "Host": "",//104.131.105.222
        "Database": "" //duo
    },
    "Mongo": {
        "ip": "",
        "port": "",
        "dbname": "dvpdb",
        "password": "",
        "user": "",
        "type": "mongodb"
    },
    "Redis":
        {
            "ip": "",
            "port": 6379,
            "user": "",
            "password": "",
            "mode": "instance",//instance, cluster, sentinel
            "db": 8,
            "sentinels": {
                "hosts": "",
                "port": 16389,
                "name": "redis-cluster"
            }
        },

    "ArdsRedis":
        {
            "ip": "",
            "port": 6389,
            "user": "",
            "password": "",
            "mode": "instance",//instance, cluster, sentinel
            "db": 6,
            "sentinels": {
                "hosts": "",
                "port": 16389,
                "name": "redis-cluster"
            }
        },

    "Security":
        {
            "ip": "",
            "port": 6389,
            "user": "",
            "password": "",
            "mode": "instance",//instance, cluster, sentinel
            "sentinels": {
                "hosts": "",
                "port": 16389,
                "name": "redis-cluster"
            }

        },

    "Host":
        {
            "domain": "0.0.0.0",
            "port": 8831,
            "version": "1.0.0.0",
            "hostpath": "./config",
            "logfilepath": ""
        }
};
