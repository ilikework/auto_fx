#!/bin/bash

#/root/.nvm/versions/node/v4.4.7/lib/node_modules/npm/node_modules
export NODE_PATH=${NVM_PATH}_modules/npm/node_modules

#cd /home/nodejs/
echo "`date` fx start..."
ps -ef | grep -v grep | grep "node fxmp.js"
if (( $(ps -ef | grep -v grep | grep "node fxmp.js" | wc -l) > 0 ))
then
	echo 'already running'
else
	node fxmp.js -cmd fxstart
fi

