# ldapTreeGenerator
Generate ldap tree with users and groups. 

## Start SLAPD docker container
```bash
docker run -t -i -d -e LDAP_ORGANISATION="ownCloud" -e LDAP_DOMAIN="owncloudqa.com" -e LDAP_ADMIN_PASSWORD="123456" -p 389:389 osixia/openldap:latest
```

## Create dump
```bash
npm install
node generator.js
? How many users do you want 100
? How many groups do you want 20
? How many users in each group do you want 10
? Is the data entered correct?(just hit enter for YES) Yes
```

## Upload dump
```bash
ldapadd -D "cn=admin,dc=owncloudqa,dc=com" -x -w 123456 -h localhost:389 -f dump.ldif
```

NOTE: All users has the same password: secret

This is for testing purposes and designed for owncloud QA team, but is very easy to adapt to other organizations.
