import _ from 'lodash';
import urlMatch from 'url-match';

const _rules = [
  {
    roles: ['administrator'],
    allows: [
      {
        resources: [
          '/customer',
          '/customer/stat',
          '/customer/export',
          '/customer/:id',
          '/customer/attachment',

          '/order',
          '/order/:id',
          '/order/:id/notes',
          '/order/:id/refund',
          '/order/customer/:customer_id',

          '/user',
          '/user/:id',
          '/user/:id/changepassword',
          '/user/status/:id',
          '/user/avatar',
          '/user/email/:email',

          '/payment/:id/status',

          '/email/template',
          '/email/template/:id',
          '/email/template/upload',

          '/setting',
          '/setting/:id',
        ],
        permissions: ['get', 'post', 'put', 'delete', 'patch'],
      },
    ],
  },
  {
    roles: ['editor', 'viewer', 'customer'],
    allows: [
      {
        resources: [
          '/customer/:id',
          '/order/:id',
          '/order/customer/:customer_id',
        ],
        permissions: ['get'],
      },
      {
        resources: [
          '/customer/:id',
          '/order/:id',
        ],
        permissions: ['put'],
      },
      {
        resources: [
          '/customer',
          '/customer/attachment',
          '/order',
        ],
        permissions: ['post'],
      },
    ],
  },
];

export default (req, res, next) => {
  const { roles } = req.user;
  const url = req.originalUrl.toLowerCase();
  const method = req.method.toLowerCase();

  let bAllow = false;
  _.each(roles, (role) => {
    // if one of the roles is permitted, we should allow him access
    _.each(_rules, (rule) => {
      if (rule.roles.indexOf(role) >= 0) {
        _.each(rule.allows, (allow) => {
          if (allow.permissions.indexOf(method) >= 0) {
            // url match
            _.each(allow.resources, (resource) => {
              const pattern = urlMatch.generate(resource);
              if (pattern.match(url)) {
                bAllow = true;
                return false;
              }
            });
          }

          if (bAllow) {
            return false;
          }
        });
      }

      if (bAllow) {
        return false;
      }
    });

    if (bAllow) {
      return false;
    }
  });

  if (!bAllow) {
    return res.error('User is not authorized', 403);
  }

  return next();
};
