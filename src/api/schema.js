import gql from "graphql-tag";

import {
  schema as userSchema,
  resolvers as userResolvers,
  buildUserOrganizationQuery
} from "./user";
import {
  schema as conversationSchema,
  getConversations,
  resolvers as conversationsResolver
} from "./conversations";
import {
  schema as organizationSchema,
  resolvers as organizationResolvers
} from "./organization";
import {
  schema as campaignSchema,
  resolvers as campaignResolvers
} from "./campaign";
import {
  schema as assignmentSchema,
  resolvers as assignmentResolvers
} from "./assignment";
import {
  schema as interactionStepSchema,
  resolvers as interactionStepResolvers
} from "./interaction-step";
import {
  schema as questionSchema,
  resolvers as questionResolvers
} from "./question";
import {
  schema as questionResponseSchema,
  resolvers as questionResponseResolvers
} from "./question-response";
import {
  schema as optOutSchema,
  resolvers as optOutResolvers
} from "./opt-out";
import {
  schema as messageSchema,
  resolvers as messageResolvers
} from "./message";
import {
  schema as campaignContactSchema,
  resolvers as campaignContactResolvers
} from "./campaign-contact";
import {
  schema as cannedResponseSchema,
  resolvers as cannedResponseResolvers
} from "./canned-response";
import { schema as inviteSchema, resolvers as inviteResolvers } from "./invite";

const rootSchema = gql`
  input CampaignContactInput {
    firstName: String!
    lastName: String!
    cell: String!
    zip: String
    external_id: String
    customFields: String
  }

  input OptOutInput {
    assignmentId: String!
    cell: Phone!
    reason: String
  }

  input QuestionResponseInput {
    campaignContactId: String!
    interactionStepId: String!
    value: String!
  }

  input AnswerOptionInput {
    action: String
    value: String!
    nextInteractionStepId: String
  }

  input InteractionStepInput {
    id: String
    questionText: String
    script: String
    answerOption: String
    answerActions: String
    parentInteractionId: String
    isDeleted: Boolean
    interactionSteps: [InteractionStepInput]
  }

  input TexterInput {
    id: String
    needsMessageCount: Int
    maxContacts: Int
    contactsCount: Int
  }

  input CampaignInput {
    title: String
    description: String
    dueBy: Date
    logoImageUrl: String
    primaryColor: String
    introHtml: String
    useDynamicAssignment: Boolean
    ingestMethod: String
    contactData: String
    organizationId: String
    texters: [TexterInput]
    interactionSteps: InteractionStepInput
    cannedResponses: [CannedResponseInput]
    overrideOrganizationTextingHours: Boolean
    textingHoursEnforced: Boolean
    textingHoursStart: Int
    textingHoursEnd: Int
    timezone: String
  }

  input MessageInput {
    text: String
    contactNumber: Phone
    assignmentId: String
    userId: String
  }

  input InviteInput {
    id: String
    is_valid: Boolean
    hash: String
    created_at: Date
  }

  input UserInput {
    id: String
    firstName: String!
    lastName: String!
    alias: String
    email: String!
    cell: String!
    oldPassword: String
    newPassword: String
  }

  input ContactMessage {
    message: MessageInput!
    campaignContactId: String!
  }

  input OffsetLimitCursor {
    offset: Int!
    limit: Int!
  }

  input CampaignIdContactId {
    campaignId: String!
    campaignContactId: Int!
    messageIds: [Int]!
  }

  input UserPasswordChange {
    email: String!
    password: String!
    passwordConfirm: String!
    newPassword: String!
  }

  type CampaignIdAssignmentId {
    campaignId: String!
    assignmentId: String!
  }

  type Action {
    name: String
    display_name: String
    instructions: String
  }

  type FoundContact {
    found: Boolean
  }

  type PageInfo {
    limit: Int!
    offset: Int!
    next: Int
    previous: Int
    total: Int!
  }

  type ReturnString {
    data: String!
  }

  enum SortPeopleBy {
    FIRST_NAME
    LAST_NAME
    NEWEST
    OLDEST
  }

  type RootQuery {
    currentUser: User
    organization(id: String!, utc: String): Organization
    campaign(id: String!): Campaign
    inviteByHash(hash: String!): [Invite]
    assignment(id: String!): Assignment
    organizations: [Organization]
    availableActions(organizationId: String!): [Action]
    conversations(
      cursor: OffsetLimitCursor!
      organizationId: String!
      campaignsFilter: CampaignsFilter
      assignmentsFilter: AssignmentsFilter
      contactsFilter: ContactsFilter
      utc: String
    ): PaginatedConversations
    campaigns(
      organizationId: String!
      cursor: OffsetLimitCursor
      campaignsFilter: CampaignsFilter
    ): CampaignsReturn
    people(
      organizationId: String!
      cursor: OffsetLimitCursor
      campaignsFilter: CampaignsFilter
      role: String
      sortBy: SortPeopleBy
    ): UsersReturn
  }

  type RootMutation {
    createInvite(invite: InviteInput!): Invite
    createCampaign(campaign: CampaignInput!): Campaign
    editCampaign(id: String!, campaign: CampaignInput!): Campaign
    deleteJob(campaignId: String!, id: String!): JobRequest
    copyCampaign(id: String!): Campaign
    exportCampaign(id: String!): JobRequest
    createCannedResponse(cannedResponse: CannedResponseInput!): CannedResponse
    createOrganization(
      name: String!
      userId: String!
      inviteId: String!
    ): Organization
    joinOrganization(
      organizationUuid: String!
      queryParams: String
    ): Organization
    editOrganizationRoles(
      organizationId: String!
      userId: String!
      campaignId: String
      roles: [String]
    ): Organization
    editUser(organizationId: String!, userId: Int!, userData: UserInput): User
    resetUserPassword(organizationId: String!, userId: Int!): String!
    changeUserPassword(userId: Int!, formData: UserPasswordChange): User
    updateTextingHours(
      organizationId: String!
      textingHoursStart: Int!
      textingHoursEnd: Int!
    ): Organization
    updateTextingHoursEnforcement(
      organizationId: String!
      textingHoursEnforced: Boolean!
    ): Organization
    updateOptOutMessage(
      organizationId: String!
      optOutMessage: String!
    ): Organization
    updateTwilioAuth(
      organizationId: String!
      twilioAccountSid: String
      twilioAuthToken: String
      twilioMessageServiceSid: String
    ): Organization
    bulkSendMessages(assignmentId: Int!): [CampaignContact]
    sendMessage(
      message: MessageInput!
      campaignContactId: String!
    ): CampaignContact
    createOptOut(
      optOut: OptOutInput!
      campaignContactId: String!
    ): CampaignContact
    editCampaignContactMessageStatus(
      messageStatus: String!
      campaignContactId: String!
    ): CampaignContact
    deleteQuestionResponses(
      interactionStepIds: [String]
      campaignContactId: String!
    ): CampaignContact
    updateQuestionResponses(
      questionResponses: [QuestionResponseInput]
      campaignContactId: String!
    ): CampaignContact
    startCampaign(id: String!): Campaign
    archiveCampaign(id: String!): Campaign
    archiveCampaigns(ids: [String!]): [Campaign]
    unarchiveCampaign(id: String!): Campaign
    sendReply(id: String!, message: String!): CampaignContact
    getAssignmentContacts(
      assignmentId: String!
      contactIds: [String]
      findNew: Boolean
    ): [CampaignContact]
    findNewCampaignContact(
      assignmentId: String!
      numberContacts: Int!
    ): FoundContact
    assignUserToCampaign(
      organizationUuid: String!
      campaignId: String!
      queryParams: String
    ): Campaign
    userAgreeTerms(userId: String!): User
    reassignCampaignContacts(
      organizationId: String!
      campaignIdsContactIds: [CampaignIdContactId]!
      newTexterUserId: String!
    ): [CampaignIdAssignmentId]
    bulkReassignCampaignContacts(
      organizationId: String!
      campaignsFilter: CampaignsFilter
      assignmentsFilter: AssignmentsFilter
      contactsFilter: ContactsFilter
      newTexterUserId: String!
    ): [CampaignIdAssignmentId]
    importCampaignScript(campaignId: String!, url: String!): Int
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`;

export const schema = [
  rootSchema,
  userSchema,
  organizationSchema,
  "scalar Date",
  "scalar JSON",
  "scalar Phone",
  campaignSchema,
  assignmentSchema,
  interactionStepSchema,
  optOutSchema,
  messageSchema,
  campaignContactSchema,
  cannedResponseSchema,
  questionResponseSchema,
  questionSchema,
  inviteSchema,
  conversationSchema
];
