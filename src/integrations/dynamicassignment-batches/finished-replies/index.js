export const requestNewBatchCount = async ({
  organization,
  campaign,
  assignment,
  texter,
  r,
  cacheableData,
  loaders
}) => {
  // START WITH SOME BASE-LINE THINGS EVERY POLICY SHOULD HAVE
  if (!campaign.use_dynamic_assignment || campaign.is_archived) {
    return 0;
  }
  if (assignment.max_contacts === 0 || !campaign.batch_size) {
    return 0;
  }
  const availableCount = await r.getCount(
    r.knex("campaign_contact").where({
      campaign_id: campaign.id,
      message_status: "needsMessage",
      assignment_id: null
    })
  );

  // Make sure they don't have any needsResponse(s)
  if (availableCount) {
    const hasOpenReplies = await r
      .knex("campaign_contact")
      .where({
        campaign_id: campaign.id,
        message_status: "needsResponse",
        assignment_id: assignment.id
      })
      .first();
    if (hasOpenReplies) {
      return 0;
    }
  }

  return availableCount;
};
