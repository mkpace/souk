### Creating/Updating the configuration parameter for staging environment

Before the first deployment of the app prepare the environment's configuration file and save it as a SSM parameter.

Bellow script assumes you prepared a file names env.<environment_name>.cfg (ex:env.development.cfg)

You might need to export also AWS_PROFILE in case you need to use a profile rather than default one.

```bash
# export AWS_PROFILE=production
export ENV=development
aws ssm put-parameter --name /souk-api/${ENV}/env.cfg --type SecureString --overwrite --value "$(< ./env.${ENV}.cfg)"
# unset AWS_PROFILE
```

When updating an existing parameter you do not have to delete the existing parameter, 
just run the same commands again and the parameter will get updated with a new version.
Keeping the previous versions help in case of a rollback or debugging. 

#### To check current configuration:

```bash
#export AWS_PROFILE=production
export ENV=development
aws ssm get-parameter --with-decryption --name /souk-api/${ENV}/env.cfg|
    grep Value|
    cut -d ':' -f 2-|
    xargs echo -e|
    sort|
    sed 's/,$//g' > env.${ENV}.cfg
#unset AWS_PROFILE
```
