# JUSTO_GLOBAL_ASSESSMENT

SQL Query to create USER Table

```sql
CREATE TABLE `user` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
    `email` varchar(255) NOT NULL COMMENT 'Unique Email',
    `phone_number` bigint NOT NULL COMMENT 'Unique Phone Number',
    `is_locked` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Account Lock Status',
    `login_attempt` tinyint(1) unsigned zerofill DEFAULT '5' COMMENT 'Login Attempts',
    `password` char(50) NOT NULL COMMENT 'users password',
    `auth_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `magic_token` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `phone_number` (`phone_number`)
)
```

SEED data SQL query :

```sql
insert into
    `user` (
        email,
        phone_number,
        is_locked,
        login_attempt,
        password,
    )
values (
        "test@gmail.com",
        9876543210,
        0,
        0,
        'test@123',
    );
```
