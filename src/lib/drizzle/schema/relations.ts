import { relations } from "drizzle-orm";
import { account } from "./account";
import { attachment } from "./attachment";
import { generation } from "./generation";
import { group } from "./group";
import { groupPermission } from "./group-permission";
import { log } from "./log";
import { outline } from "./outline";
import { permission } from "./permission";
import { presentation } from "./presentation";
import { presentationEntry } from "./presentation-entry";
import { presentationFavorite } from "./presentation-favorite";
import { presentationMember } from "./presentation-member";
import { session } from "./session";
import { slide } from "./slide";
import { storageAttachment } from "./storage-attachment";
import { storageBlob } from "./storage-blob";
import { user } from "./user";
import { userGroup } from "./user-group";
import { userPermission } from "./user-permission";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  presentations: many(presentation),
  members: many(presentationMember, { relationName: "member_user" }),
  invitations: many(presentationMember, { relationName: "invited_by_user" }),
  favorites: many(presentationFavorite),
  logs: many(log),
  userGroups: many(userGroup, { relationName: "user_group_user" }),
  assignedUserGroups: many(userGroup, { relationName: "user_group_assigned_by" }),
  createdGroups: many(group, { relationName: "group_created_by" }),
  assignedGroupPermissions: many(groupPermission, { relationName: "group_permission_assigned_by" }),
  userPermissions: many(userPermission),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  createdByUser: one(user, { fields: [group.createdBy], references: [user.id], relationName: "group_created_by" }),
  userGroups: many(userGroup),
  groupPermissions: many(groupPermission),
}));

export const userGroupRelations = relations(userGroup, ({ one }) => ({
  user: one(user, { fields: [userGroup.userId], references: [user.id], relationName: "user_group_user" }),
  group: one(group, { fields: [userGroup.groupId], references: [group.id] }),
  assignedByUser: one(user, { fields: [userGroup.assignedBy], references: [user.id], relationName: "user_group_assigned_by" }),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  groupPermissions: many(groupPermission),
  userPermissions: many(userPermission),
}));

export const groupPermissionRelations = relations(groupPermission, ({ one }) => ({
  group: one(group, { fields: [groupPermission.groupId], references: [group.id] }),
  permission: one(permission, { fields: [groupPermission.permissionId], references: [permission.id] }),
  assignedByUser: one(user, { fields: [groupPermission.assignedBy], references: [user.id], relationName: "group_permission_assigned_by" }),
}));

export const userPermissionRelations = relations(userPermission, ({ one }) => ({
  user: one(user, { fields: [userPermission.userId], references: [user.id] }),
  permission: one(permission, { fields: [userPermission.permissionId], references: [permission.id] }),
}));

export const presentationRelations = relations(presentation, ({ one, many }) => ({
  user: one(user, { fields: [presentation.userId], references: [user.id] }),
  members: many(presentationMember),
  favorites: many(presentationFavorite),
  outlines: many(outline),
  slides: many(slide),
  generations: many(generation),
  attachments: many(attachment),
  entries: many(presentationEntry),
}));

export const presentationFavoriteRelations = relations(presentationFavorite, ({ one }) => ({
  presentation: one(presentation, { fields: [presentationFavorite.presentationId], references: [presentation.id] }),
  user: one(user, { fields: [presentationFavorite.userId], references: [user.id] }),
}));

export const attachmentRelations = relations(attachment, ({ one }) => ({
  presentation: one(presentation, { fields: [attachment.presentationId], references: [presentation.id] }),
}));

export const presentationEntryRelations = relations(presentationEntry, ({ one }) => ({
  presentation: one(presentation, { fields: [presentationEntry.presentationId], references: [presentation.id] }),
  sourceSuggestion: one(presentationEntry, {
    fields: [presentationEntry.sourceSuggestionId],
    references: [presentationEntry.id],
    relationName: "presentation_entry_source_suggestion",
  }),
}));

export const storageBlobRelations = relations(storageBlob, ({ many }) => ({
  attachments: many(storageAttachment),
}));

export const storageAttachmentRelations = relations(storageAttachment, ({ one }) => ({
  blob: one(storageBlob, { fields: [storageAttachment.blobId], references: [storageBlob.id] }),
}));

export const presentationMemberRelations = relations(presentationMember, ({ one }) => ({
  presentation: one(presentation, { fields: [presentationMember.presentationId], references: [presentation.id] }),
  user: one(user, { fields: [presentationMember.userId], references: [user.id], relationName: "member_user" }),
  invitedByUser: one(user, { fields: [presentationMember.invitedBy], references: [user.id], relationName: "invited_by_user" }),
}));

export const outlineRelations = relations(outline, ({ one, many }) => ({
  presentation: one(presentation, { fields: [outline.presentationId], references: [presentation.id] }),
  slides: many(slide),
}));

export const slideRelations = relations(slide, ({ one }) => ({
  presentation: one(presentation, { fields: [slide.presentationId], references: [presentation.id] }),
  outline: one(outline, { fields: [slide.outlineId], references: [outline.id] }),
}));

export const generationRelations = relations(generation, ({ one, many }) => ({
  presentation: one(presentation, { fields: [generation.presentationId], references: [presentation.id] }),
  logs: many(log),
}));

export const logRelations = relations(log, ({ one }) => ({
  user: one(user, { fields: [log.userId], references: [user.id] }),
  generation: one(generation, { fields: [log.generationId], references: [generation.id] }),
}));
