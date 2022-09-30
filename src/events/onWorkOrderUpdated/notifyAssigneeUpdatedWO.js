import { User } from "@models/User";
import { lambdaClient } from "@lib/lambdaClient";
import { WorkOrderPushNotification } from "@events/pushNotifications";

/**
 * After a WorkOrder is updated by the User who created it, this event handler
 * determines which Users were impacted by the changes, if any, and sends push
 * notifications informing them of the update. The table below lists the three
 * types of WorkOrder state-changes which trigger push notifications:
 *
 * | WO State Change | Description                                                      |
 * | :-------------- | :--------------------------------------------------------------- |
 * | UNASSIGNMENT    | Assignee has been unassigned from a WO.                          |
 * | ASSIGNMENT      | Assignee has a new WO assignment.                                |
 * | UPDATE          | Assignee has an existing WO that's been updated by the customer. |
 *
 * The determination as to which notifications to send and to whom is made by
 * comparing the WO's current `"assignedToUserID"` value against the value as
 * it was before the update. The table below lists the possible outcomes of this
 * comparison, and the actions taken for each one:
 *
 * | Was Assigned? | Now Assigned? | Same Assignee? | Action                                                    |
 * | :-----------: | :-----------: | :------------: | :-------------------------------------------------------- |
 * |      No       |      No       |       -        | Do nothing.                                               |
 * |      Yes      |      No       |       -        | Notify previous Assignee of the UNASSIGNMENT              |
 * |      No       |      Yes      |       -        | Notify new Assignee of the ASSIGNMENT                     |
 * |      Yes      |      Yes      |      Yes       | Notify Assignee of the UPDATE                             |
 * |      Yes      |      Yes      |       No       | Notify previous: UNASSIGNMENT, AND Notify new: ASSIGNMENT |
 */
export const notifyAssigneeUpdatedWO = async (currentWOstate, prevWOstate) => {
  const pushNotificationsToSend = [];

  const { assignedToUserID: currentAssignedToUserID } = currentWOstate;
  const { assignedToUserID: prevAssignedToUserID } = prevWOstate;

  /* If the current and previous assignments are not the same, then
  the possible notifications to send are UNASSIGNED / ASSIGNED.  */
  if (currentAssignedToUserID !== prevAssignedToUserID) {
    !!prevAssignedToUserID &&
      pushNotificationsToSend.push(
        new WorkOrderPushNotification({
          pushEventName: "WorkOrderUnassigned",
          recipientUser: { id: prevAssignedToUserID },
          workOrder: prevWOstate
        })
      );

    !!currentAssignedToUserID &&
      pushNotificationsToSend.push(
        new WorkOrderPushNotification({
          pushEventName: "WorkOrderAssigned",
          recipientUser: { id: currentAssignedToUserID },
          workOrder: currentWOstate
        })
      );

    // If there's been no re-assignment, see if an UPDATE notification needs to be sent
  } else if (currentAssignedToUserID) {
    pushNotificationsToSend.push(
      new WorkOrderPushNotification({
        pushEventName: "WorkOrderUpdated",
        recipientUser: { id: currentAssignedToUserID },
        workOrder: currentWOstate
      })
    );
  }

  if (pushNotificationsToSend.length > 0) {
    // Get the users push notification tokens
    const usersToNotify = await User.batchGetUsersByID(
      pushNotificationsToSend.map(({ data }) => ({
        id: data._recipientUser,
        sk: `#DATA#${data._recipientUser}`
      }))
    );

    // Remove push notifications for users without valid push tokens (bad tokens are rm'd by push service).
    const deliverablePushNotifications = pushNotificationsToSend.reduce((accum, pushMsgObj) => {
      // Find the User Item
      const user = usersToNotify.find((user) => user.id === pushMsgObj.data._recipientUser);

      // If the User has a valid push token, add it to pushMsgObj, else msg must be discarded.
      if (user?.expoPushToken) {
        accum.push({
          to: user.expoPushToken,
          ...pushMsgObj
        });
      }

      return accum;
    }, []); // <-- reducer init accum is empty array

    // Submit deliverable push msgs as the PushService Lambda fn payload
    await lambdaClient.invokeEvent("PushNotificationService", deliverablePushNotifications);
  }
};
