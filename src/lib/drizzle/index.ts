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
import * as presentationEntrySchema from './schema/presentation-entry'
import * as presentationMemberSchema from './schema/presentation-member'
import * as outlineSchema from './schema/outline'
import * as slideSchema from './schema/slide'
import * as generationSchema from './schema/generation'
import * as logSchema from './schema/log'
import * as attachmentSchema from './schema/attachment'
import * as storageBlobSchema from './schema/storage-blob'
import * as storageAttachmentSchema from './schema/storage-attachment'
import * as cacheSchema from './schema/cache'
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
  ...presentationEntrySchema,
  ...presentationMemberSchema,
  ...outlineSchema,
  ...slideSchema,
  ...generationSchema,
  ...logSchema,
  ...attachmentSchema,
  ...storageBlobSchema,
  ...storageAttachmentSchema,
  ...cacheSchema,
  ...relationsSchema,
}

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client, { schema })

// Tipo do handle recebido dentro de um db.transaction(async (tx) => ...) —
// extraído diretamente da assinatura de db.transaction, não escrito à mão, pra
// nunca dessincronizar caso a versão do drizzle mude o tipo interno. Repository
// que precisa participar de uma transação aceita `DbClient` (db OU tx) como
// último parâmetro opcional, default `db` — só paga esse custo quem precisa.
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type DbClient = typeof db | DbTransaction
