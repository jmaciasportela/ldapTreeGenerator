# ldapTreeGenerator
Generate ldap tree with test users and groups

npm install
node generator.js
? How many users do you want 100
? How many groups do you want 20
? How many users in each group do you want 10
? Is the data entered correct?(just hit enter for YES) Yes

ldapadd -D "cn=admin,dc=testldap,dc=com" -x -w PASSWORD -h YOUR_HOST -f dump.ldif
