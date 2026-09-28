import { LOGIN_PAGE, router } from "@/router";
import { call, createResource } from "frappe-ui";
import { defineStore } from "pinia";
import { computed, ComputedRef, Ref, ref } from "vue";

const URI_LOGIN = "login";
const URI_LOGOUT = "logout";
const URI_USER_INFO = "helpdesk.api.auth.get_user";
const TRAVELOS_LOGIN_DESTINATION = "/helpdesk/dashboard";

/**
 * This is supposed to be the entry point of authentication. This will be
 * called from router itself. Hence the router instance from `useRouter()` will
 * not be available. All Authentication related logic should go in this file.
 * Some of these might contain async methods, beware. */
export const useAuthStore = defineStore("auth", () => {
  const userInfo = createResource({
    url: URI_USER_INFO,
  });
  const init = async () => {
    if (userInfo.fetched) return;
    await userInfo.fetch();
  };
  const reloadUser = userInfo.reload;

  const user__ = computed(() => userInfo.data || {});
  const hasDeskAccess: ComputedRef<boolean> = computed(
    () => user__.value.has_desk_access
  );
  const isAdmin: ComputedRef<boolean> = computed(() => user__.value.is_admin);
  const isAgent: ComputedRef<boolean> = computed(() => user__.value.is_agent);
  const isManager: ComputedRef<boolean> = computed(
    () => user__.value.is_manager
  );
  const hasAgentRecord: ComputedRef<boolean> = computed(
    () => Boolean(user__.value.has_agent_record)
  );

  const userId: ComputedRef<string> = computed(() => user__.value.user_id);
  const userImage: ComputedRef<string> = computed(
    () => user__.value.user_image
  );
  const userFirstName: ComputedRef<string> = computed(
    () => user__.value.user_first_name
  );
  const userLastName: ComputedRef<string> = computed(
    () => user__.value.user_last_name
  );
  const userName: ComputedRef<string> = computed(() => user__.value.user_name);
  const username: ComputedRef<string> = computed(() => user__.value.username);
  const timezone: ComputedRef<string> = computed(() => user__.value.time_zone);
  const language: ComputedRef<string> = computed(() => user__.value.language);
  const userTeams: ComputedRef<string[]> = computed(
    () => user__.value.user_teams
  );
  const availability: ComputedRef<string> = computed(
    () => user__.value.availability
  );
  const availabilityChangedOn: ComputedRef<string> = computed(
    () => user__.value.availability_changed_on
  );
  const availabilityChangedBy: ComputedRef<string> = computed(
    () => user__.value.availability_changed_by
  );

  function sessionUser() {
    const cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
    let _sessionUser = cookies.get("user_id");
    if (_sessionUser === "Guest") {
      _sessionUser = null;
    }
    return _sessionUser;
  }
  const user: Ref<string> = ref(sessionUser());
  const isLoggedIn: ComputedRef<boolean> = computed(() => !!user.value);
  function getSafeRedirectPath() {
    const value = router.currentRoute.value.query["redirect-to"];
    const redirectTo = Array.isArray(value) ? value[0] : value;
    if (!redirectTo || typeof redirectTo !== "string") return null;

    const trimmed = redirectTo.trim();
    if (
      !trimmed ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ) {
      return null;
    }

    try {
      const url = new URL(trimmed, window.location.origin);
      if (url.origin !== window.location.origin) return null;
      if (!url.pathname.startsWith("/helpdesk") && !url.pathname.startsWith("/")) {
        return null;
      }

      const path = url.pathname.startsWith("/helpdesk")
        ? url.pathname.slice("/helpdesk".length) || "/"
        : url.pathname;

      if (!path.startsWith("/")) return null;
      return `${path}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  const login = createResource({
    url: URI_LOGIN,
    onError() {
      throw new Error("Invalid email or password");
    },
    async onSuccess() {
      user.value = sessionUser();
      const redirectPath = getSafeRedirectPath();
      login.reset();

      if (redirectPath) {
        router.replace(redirectPath);
        return;
      }

      await init();
      router.replace(
        hasDeskAccess.value ? { name: "Dashboard" } : { name: "TicketsCustomer" }
      );
    },
  });

  function logout() {
    user.value = null;
    call(URI_LOGOUT).then(() => {
      window.location.href =
        LOGIN_PAGE + "?redirect-to=" + encodeURIComponent(TRAVELOS_LOGIN_DESTINATION);
    });
  }

  return {
    availability,
    availabilityChangedBy,
    availabilityChangedOn,
    hasAgentRecord,
    hasDeskAccess,
    init,
    isAdmin,
    isAgent,
    isManager,
    isLoggedIn,
    login,
    reloadUser,
    userFirstName,
    userId,
    userImage,
    userLastName,
    userName,
    username,
    timezone,
    language,
    userTeams,
    user,
    logout,
  };
});
