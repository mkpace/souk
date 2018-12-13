#!/bin/bash -el
set -e
set -o pipefail

IDENTIFIER=`cat souk-api-build-version.txt|cut -d '-' -f 3`

echo Build Identifier: ${IDENTIFIER}
S3BUCKET="${ENV}-deployments-souk"

# Switch AWS account for production
if [ "${ENV}" == "production" ]; then
	. $WORKSPACE/../update-souk-cloud-code-${ENV}/aws/switch_prod.sh
else
	unset AWS_ACCESS_KEY_ID
	unset AWS_SECRET_ACCESS_KEY
fi

# copy artifact
aws s3 cp --no-progress souk-api-common.zip s3://${S3BUCKET}/${ENV}-souk-api/${IDENTIFIER}/
aws s3 cp --no-progress souk-api-functions.zip s3://${S3BUCKET}/${ENV}-souk-api/${IDENTIFIER}/

# update CF stack
export BuildTag=${IDENTIFIER}
$WORKSPACE/../update-souk-cloud-code-${ENV}/aws/cf_deploy.sh -e ${ENV} -t cloud/souk-api-master.yml --non-interactive