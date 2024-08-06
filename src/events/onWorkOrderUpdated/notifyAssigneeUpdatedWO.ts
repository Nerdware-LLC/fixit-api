import { WorkOrderPushNotification } from "@/events/pushNotifications";
import { lambdaClient } from "@/lib/lambdaClient";
import { User } from "@/models/User";
import type { WorkOrderItem } from "@/models/WorkOrder";

/**
 * Sends push notifications to Users when a WorkOrder is updated. Determines which Users
 * were impacted by the changes, if any, and sends the appropriate notifications based on
 * the previous and new assignment of the WorkOrder. The table below lists the three
 * types of WorkOrder state-changes which result in push notifications being issued from
 * this function:
 *
 * | WO State Change | Description                                                      |
 * | :-------------- | :--------------------------------------------------------------- |
 * | UNASSIGNMENT    | Assignee has been unassigned from a WO.                          |
 * | ASSIGNMENT      | Assignee has a new WO assignment.                                |
 * | UPDATE          | Assignee has an existing WO that's been updated by the customer. |
 *
 * The determination as to which notifications to send and to whom is made by comparing the
 * WO's new `assignedTo.id` value against the value as it was before the update. The table
 * below lists the possible outcomes of this comparison, and the actions taken for each one:
 *
 * | Was Assigned? | Now Assigned? | Same Assignee? | Action                                                    |
 * | :-----------: | :-----------: | :------------: | :-------------------------------------------------------- |
 * |      No       |      No       |       -        | Do nothing.                                               |
 * |      Yes      |      No       |       -        | Notify previous Assignee of the UNASSIGNMENT              |
 * |      No       |      Yes      |       -        | Notify new Assignee of the ASSIGNMENT                     |
 * |      Yes      |      Yes      |      Yes       | Notify Assignee of the UPDATE                             |
 * |      Yes      |      Yes      |       No       | Notify previous: UNASSIGNMENT, AND Notify new: ASSIGNMENT |
 *
 * @param newWOstate - The new state of the WorkOrder.
 * @param prevWOstate - The previous state of the WorkOrder.
 */
export const notifyAssigneeUpdatedWO = async (
  newWOstate: WorkOrderItem,
  prevWOstate: WorkOrderItem
) => {
  // Array of WorkOrderPushNotifications for any impacted Users
  const pushNotificationsToImpactedUsers: Array<WorkOrderPushNotification> = [];

  const { assignedToUserID: newAssigneeUserID } = newWOstate;
  const { assignedToUserID: prevAssigneeUserID } = prevWOstate;

  /* If the new and previous assignments are not the same, then
  the possible notifications to send are UNASSIGNED/ASSIGNED.  */
  if (newAssigneeUserID !== prevAssigneeUserID) {
    // Check if previous assignee exists
    if (prevAssigneeUserID) {
      pushNotificationsToImpactedUsers.push(
        new WorkOrderPushNotification({
          pushEventName: "WorkOrderUnassigned",
          recipientUser: { id: prevAssigneeUserID },
          workOrder: prevWOstate,
        })
      );
    }
    // Check if new assignee exists
    if (newAssigneeUserID) {
      pushNotificationsToImpactedUsers.push(
        new WorkOrderPushNotification({
          pushEventName: "WorkOrderAssigned",
          recipientUser: { id: newAssigneeUserID },
          workOrder: newWOstate,
        })
      );
    }
    // If there's been no re-assignment, see if an UPDATE notification needs to be sent
  } else if (newAssigneeUserID) {
    if (newAssigneeUserID) {
      pushNotificationsToImpactedUsers.push(
        new WorkOrderPushNotification({
          pushEventName: "WorkOrderUpdated",
          recipientUser: { id: newAssigneeUserID },
          workOrder: newWOstate,
        })
      );
    }
  }

  // The PN objects lack User's expoPushTokens, so they must be retrieved from the DB
  if (pushNotificationsToImpactedUsers.length > 0) {
    // Use batchGetItems to get the users push notification tokens
    const impactedUsers = await User.batchGetItems(
      pushNotificationsToImpactedUsers.map(({ data }) => ({ id: data._recipientUser }))
    );

    // Update PNs for Users with valid push tokens, remove PNs for Users without valid tokens.
    // Note: per Expo's recommendation, bad/invalid tokens are removed by the push service.
    const deliverablePNs = pushNotificationsToImpactedUsers.reduce(
      (accum: Array<WorkOrderPushNotification>, pushNotification) => {
        // Find the User Item
        const user = impactedUsers.find((user) => user.id === pushNotification.data._recipientUser);

        // If the User has a valid push token, it's added to the PN, otherwise the PN is discarded.
        if (user?.expoPushToken) {
          accum.push({
            ...pushNotification,
            to: user.expoPushToken,
          });
        }

        return accum;
      },
      [] // <-- reducer accum is initialized as an empty array
    );

    // If there are any deliverable push notifications, send them to the PushService
    if (deliverablePNs.length > 0)
      // Submit deliverable push msgs as the PushService Lambda fn payload
      await lambdaClient.invokeEvent("PushNotificationService", deliverablePNs);
  }
};
