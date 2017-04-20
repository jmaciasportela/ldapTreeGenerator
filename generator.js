var fs = require('fs');
var randomName = require('node-random-name');
var sillyName = require('sillyname');
var inquirer = require('inquirer');

var names = [];
var names_joined = []

var groups = [];
var groups_joined = []


var questions = [
    {
        type: 'input',
        name: 'users',
        message: 'How many users do you want',
        validate: function (value) {
            var valid = value.match(/^\d+$/);
            if (valid) {
                return true;
            }
            return 'Please enter valid number';
        }
    },
    {
        type: 'input',
        name: 'groups',
        message: 'How many groups do you want',
        validate: function (value) {
            var valid = value.match(/^\d+$/);
            if (valid) {
                return true;
            }
            return 'Please enter valid number';
        }
    },
    {
        type: 'input',
        name: 'usersInGroups',
        message: 'How many users in each group do you want',
        validate: function (value) {
            var valid = value.match(/^\d+$/);
            if (valid) {
                return true;
            }
            return 'Please enter valid number';
        }
    },
    {
        type: 'confirm',
        name: 'askAgain',
        message: 'Is the data entered correct?(just hit enter for YES)',
        default: true
    }
];

var initPrompt = function () {
    inquirer.prompt(questions).then(function (params) {
        if (!params.askAgain) {
            initPrompt();
        } else {
            createTree(params)
        }
    });
}

var createTree = function(params) {

for(var i=0; i < parseInt(params.users); i++){
	names[i] = randomName({ random: Math.random });
	names_joined.push(names[i].toLowerCase().replace(" ", "_"));
}

for(var i=0; i < parseInt(params.groups); i++){
	groups[i] = sillyName();
	groups_joined.push(groups[i].toLowerCase().replace(" ", "-"));
}

// delete previous file if exists
if(fs.existsSync('dump.ldif')){
	fs.unlinkSync('dump.ldif');
}  

var header = `# extended LDIF
#
# LDAPv3
# base <dc=owncloudqa,dc=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# people, owncloudqa.com
dn: ou=people,dc=owncloudqa,dc=com
objectClass: organizationalUnit
ou: people

# groups, owncloudqa.com
dn: ou=groups,dc=owncloudqa,dc=com
objectClass: organizationalUnit
ou: groups
`;
fs.appendFileSync('dump.ldif', header);

// Create users
// # name_joined, people, owncloudqa.com
// dn: uid=name_joined,ou=people,dc=owncloudqa,dc=com
// objectClass: person
// objectClass: organizationalPerson
// objectClass: inetOrgPerson
// cn: name
// sn: surname
// userPassword:: e1NTSEF9YWppZkFtckxIeExvcm0yOUdoWHBmYzdkU3Zpa2VzS2Q=
// uid: name_joined
// displayName: displayName

var user = `
# name_joined, people, owncloudqa.com
dn: uid=name_joined,ou=people,dc=owncloudqa,dc=com
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
cn: name
sn: surname
userPassword:: e1NTSEF9YWppZkFtckxIeExvcm0yOUdoWHBmYzdkU3Zpa2VzS2Q=
uid: name_joined
displayName: fullName
`;

for(var i=0; i < parseInt(params.users); i++){
	var guy = names[i].split(" ");
	var currentUser = user.replace(/name_joined/g, names_joined[i])
	                      .replace(/surname/g, guy[1])
	                      .replace(/name/g, guy[0])
	                      .replace(/fullName/g, names[i]);
	fs.appendFileSync('dump.ldif', currentUser);
}

var group_header = `
# group_joined, groups, owncloudqa.com
dn: cn=group_joined,ou=groups,dc=owncloudqa,dc=com
objectClass: groupOfNames
member: cn=null,dc=owncloudqa,dc=com`;

var group_footer = `
description: group of users
cn: group_joined
`;


for(var i=0; i < parseInt(params.groups); i++){
	var seed = [...Array(parseInt(params.users)).keys()];
	var group = group_header.replace(/group_joined/g, groups_joined[i]);
	var members = shuffle(seed);

	for(var j=0; j < parseInt(params.usersInGroups); j++){
		var index = members.next().value;
		group = group + '\nmember: uid=' + names_joined[index]+ ',ou=people,dc=owncloudqa,dc=com';
	}

	group = group + group_footer.replace(/group_joined/g, groups_joined[i]);
	fs.appendFileSync('dump.ldif', group);
}

}

var shuffle = function* (array) {
    var i = array.length;
    while (i--) {
        yield array.splice(Math.floor(Math.random() * (i+1)), 1)[0];
    }
}


initPrompt();