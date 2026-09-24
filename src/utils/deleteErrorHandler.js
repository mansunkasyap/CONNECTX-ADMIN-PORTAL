/**
 * Returns a user-friendly error message for failed delete operations.
 *
 * Handles PostgreSQL foreign key violation (23503): record is in use elsewhere.
 * For other failures, falls back to the API message or a generic string.
 *
 * Usage:
 *   const msg = getDeleteErrorMessage(response.data);
 *   showToast("error", msg);
 *
 * Change `entityLabel` to name the thing being deleted, e.g. "Branch Manager".
 */
export function getDeleteErrorMessage(responseData, entityLabel = "This record") {
	const code = responseData?.responseCode ?? responseData?.code;
	const apiMessage = responseData?.message ?? "";

	if (code === "23503") {
		return `${entityLabel} cannot be deleted because it is currently assigned to one or more other entries. Please remove those associations first.`;
	}

	if (code === "23505") {
		return apiMessage || "A duplicate entry already exists.";
	}

	return apiMessage || "Something went wrong while deleting. Please try again.";
}
