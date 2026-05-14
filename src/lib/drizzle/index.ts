import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/config/env-config'
import * as userSchema from './schema/user'
import * as sessionSchema from './schema/session'
import * as accountSchema from './schema/account'
import * as verificationSchema from './schema/verification'
import * as groupSchema from './schema/group'
import * as userGroupSchema from './schema/user-group'
import * as permissionSchema from './schema/permission'
import * as groupPermissionSchema from './schema/group-permission'
import * as userPermissionSchema from './schema/user-permission'
import * as presentationSchema from './schema/presentation'
import * as presentationMemberSchema from './schema/presentation-member'
import * as outlineSchema from './schema/outline'
import * as slideSchema from './schema/slide'
import * as generationSchema from './schema/generation'
import * as logSchema from './schema/log'
import * as relationsSchema from './schema/relations'

const schema = {
  ...userSchema,
  ...sessionSchema,
  ...accountSchema,
  ...verificationSchema,
  ...groupSchema,
  ...userGroupSchema,
  ...permissionSchema,
  ...groupPermissionSchema,
  ...userPermissionSchema,
  ...presentationSchema,
  ...presentationMemberSchema,
  ...outlineSchema,
  ...slideSchema,
  ...generationSchema,
  ...logSchema,
  ...relationsSchema,
}

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client, { schema })
