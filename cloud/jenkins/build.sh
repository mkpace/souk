#!/bin/bash -el
set -e
set -o pipefail

echo Working on ${BRANCH} content ...

# getting deps
npm install

# tests
cp env.example env.yml
npm run test

# package
serverless package
mkdir -p .serverless/unpacked/nodejs
cd .serverless/unpacked
unzip ../souk-api.zip
rm ../souk-api.zip
mv node_modules ./nodejs/
zip -r ../souk-api-common.zip ./nodejs
rm -r ./nodejs
zip -r ../souk-api-functions.zip ./*

cd ${WORKSPACE}
ENV=`basename ${BRANCH}`
TIMESTAMP=`date +%Y%m%d%H%M%S`

# setting build name
echo \#${BUILD_NUMBER}-${ENV}-${TIMESTAMP} > souk-api-build-version.txt

# preparing parameter for deploy job
PARAMS_FILE=souk-api-deploy.params
if [ "${ENV}" == "production" -o "${ENV}" == "staging" ]; then
	echo "ENV=${ENV}" > ${PARAMS_FILE}
else
	echo "ENV=development" > ${PARAMS_FILE}
fi
echo "BUILD_TO_DEPLOY=${BUILD_NUMBER}" >> ${PARAMS_FILE}

echo Work DONE!